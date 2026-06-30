import type { SessionUser } from "./auth";
import { getPool, isTableName, parseSelect, quoteIdent, type TableName } from "./db";

type Filter = { column: string; value: unknown };

const ADMIN_ONLY_TABLES: TableName[] = [
  "inventory_items",
  "inventory_transactions",
  "messages",
];

async function getOwnerIds(userId: string): Promise<string[]> {
  const pool = getPool();
  const { rows } = await pool.query("SELECT id FROM owners WHERE user_id = $1", [userId]);
  return rows.map((r: { id: string }) => r.id);
}

async function getPetIds(userId: string): Promise<string[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT p.id FROM pets p JOIN owners o ON p.owner_id = o.id WHERE o.user_id = $1`,
    [userId]
  );
  return rows.map((r: { id: string }) => r.id);
}

function assertTable(table: string): TableName {
  if (!isTableName(table)) throw new Error(`Invalid table: ${table}`);
  return table;
}

export async function authorizeTableAccess(
  user: SessionUser,
  table: TableName,
  action: "select" | "insert" | "update" | "delete"
) {
  if (user.role === "admin") return;

  if (ADMIN_ONLY_TABLES.includes(table)) {
    throw new Error("Forbidden");
  }

  if (action !== "select" && user.role === "owner") {
    if (table === "appointments" && action === "insert") return;
    if (table === "owners" && action === "update") return;
    throw new Error("Forbidden");
  }
}

export async function buildOwnerScope(
  user: SessionUser,
  table: TableName
): Promise<{ clause: string; params: unknown[] } | null> {
  if (user.role === "admin") return null;

  const ownerIds = await getOwnerIds(user.id);
  const petIds = await getPetIds(user.id);

  switch (table) {
    case "owners":
      return { clause: "t.user_id = $1", params: [user.id] };
    case "pets":
      return ownerIds.length
        ? { clause: `t.owner_id = ANY($1::uuid[])`, params: [ownerIds] }
        : { clause: "FALSE", params: [] };
    case "appointments":
      return ownerIds.length
        ? { clause: `t.owner_id = ANY($1::uuid[])`, params: [ownerIds] }
        : { clause: "FALSE", params: [] };
    case "vaccinations":
    case "dewormings":
    case "care_records":
      return petIds.length
        ? { clause: `t.pet_id = ANY($1::uuid[])`, params: [petIds] }
        : { clause: "FALSE", params: [] };
    case "lab_transactions":
      return ownerIds.length
        ? { clause: `t.owner_id = ANY($1::uuid[])`, params: [ownerIds] }
        : { clause: "FALSE", params: [] };
    case "lab_transaction_items": {
      if (!ownerIds.length) return { clause: "FALSE", params: [] };
      return {
        clause: `t.transaction_id IN (SELECT id FROM lab_transactions WHERE owner_id = ANY($1::uuid[]))`,
        params: [ownerIds],
      };
    }
    case "profiles":
      return { clause: "t.id = $1", params: [user.id] };
    case "user_roles":
      return { clause: "t.user_id = $1", params: [user.id] };
    default:
      return null;
  }
}

function shapeRows(rows: Record<string, unknown>[], joins: ReturnType<typeof parseSelect>["joins"]) {
  return rows.map((row) => {
    const result = { ...row };
    for (const j of joins) {
      const nested: Record<string, unknown> = {};
      let hasNested = false;
      for (const key of Object.keys(row)) {
        if (key.startsWith(`${j.alias}_`)) {
          nested[key.slice(j.alias.length + 1)] = row[key];
          delete result[key];
          hasNested = true;
        }
      }
      if (hasNested) (result as Record<string, unknown>)[j.alias] = nested;
    }
    return result;
  });
}

export async function querySelect(opts: {
  user: SessionUser;
  table: string;
  select?: string;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean };
  single?: boolean;
  maybeSingle?: boolean;
}) {
  const table = assertTable(opts.table);
  await authorizeTableAccess(opts.user, table, "select");

  const pool = getPool();
  const selectStr = opts.select ?? "*";
  const { baseColumns, joins } = parseSelect(selectStr);
  const scope = await buildOwnerScope(opts.user, table);

  const params: unknown[] = [];
  let paramIdx = 1;
  const tableAlias = "t";
  const tableName = quoteIdent(table);

  const baseSelect =
    baseColumns === "*"
      ? `${tableAlias}.*`
      : baseColumns
          .split(",")
          .map((c) => `${tableAlias}.${quoteIdent(c.trim())}`)
          .join(", ");

  const joinSelect = joins
    .map((j) => {
      const alias = quoteIdent(j.alias);
      return j.columns === "*"
        ? `${alias}.*`
        : j.columns
            .split(",")
            .map((c) => `${alias}.${quoteIdent(c.trim())} AS ${j.alias}_${c.trim()}`)
            .join(", ");
    })
    .join(", ");

  const joinClauses = joins
    .map((j) => {
      const alias = quoteIdent(j.alias);
      const joinTable = quoteIdent(j.table);
      return `LEFT JOIN ${joinTable} ${alias} ON ${tableAlias}.${quoteIdent(j.fk)} = ${alias}.id`;
    })
    .join(" ");

  const selectClause = joinSelect ? `${baseSelect}, ${joinSelect}` : baseSelect;
  let query = `SELECT ${selectClause} FROM ${tableName} ${tableAlias}`;
  if (joinClauses) query += ` ${joinClauses}`;

  const where: string[] = [];

  if (scope) {
    where.push(scope.clause.replace(/\bt\./g, `${tableAlias}.`));
    params.push(...scope.params);
    paramIdx += scope.params.length;
  }

  for (const f of opts.filters ?? []) {
    const col = f.column.includes(".") ? f.column : `${tableAlias}.${quoteIdent(f.column)}`;
    where.push(`${col} = $${paramIdx}`);
    params.push(f.value);
    paramIdx++;
  }

  if (where.length) query += ` WHERE ${where.join(" AND ")}`;

  if (opts.order?.column) {
    const dir = opts.order.ascending === false ? "DESC" : "ASC";
    query += ` ORDER BY ${tableAlias}.${quoteIdent(opts.order.column)} ${dir}`;
  }

  if (opts.single || opts.maybeSingle) query += " LIMIT 1";

  const { rows } = await pool.query(query, params);
  const shaped = shapeRows(rows as Record<string, unknown>[], joins);

  if (opts.single) {
    if (shaped.length === 0) throw new Error("No rows found");
    return shaped[0];
  }
  if (opts.maybeSingle) return shaped[0] ?? null;
  return shaped;
}

export async function queryInsert(opts: {
  user: SessionUser;
  table: string;
  data: Record<string, unknown> | Record<string, unknown>[];
  returning?: boolean;
}) {
  const table = assertTable(opts.table);
  await authorizeTableAccess(opts.user, table, "insert");

  const pool = getPool();
  const rows = Array.isArray(opts.data) ? opts.data : [opts.data];
  const results: Record<string, unknown>[] = [];

  for (const row of rows) {
    const keys = Object.keys(row).map(quoteIdent);
    const values = Object.values(row);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO ${quoteIdent(table)} (${keys.join(", ")}) VALUES (${placeholders})${
      opts.returning ? " RETURNING *" : ""
    }`;
    const { rows: inserted } = await pool.query(query, values);
    if (opts.returning && inserted.length) results.push(inserted[0] as Record<string, unknown>);
  }

  if (opts.returning) {
    return Array.isArray(opts.data) ? results : results[0] ?? null;
  }
  return null;
}

export async function queryUpdate(opts: {
  user: SessionUser;
  table: string;
  data: Record<string, unknown>;
  filters: Filter[];
}) {
  const table = assertTable(opts.table);
  await authorizeTableAccess(opts.user, table, "update");

  const pool = getPool();
  const keys = Object.keys(opts.data).map(quoteIdent);
  const values = Object.values(opts.data);

  let paramIdx = values.length + 1;
  const whereParts = opts.filters.map((f) => {
    const part = `${quoteIdent(f.column)} = $${paramIdx}`;
    paramIdx++;
    values.push(f.value);
    return part;
  });

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const query = `UPDATE ${quoteIdent(table)} SET ${setClause} WHERE ${whereParts.join(" AND ")}`;
  await pool.query(query, values);
}

export async function registerUser(opts: {
  email: string;
  password: string;
  fullName: string;
  contact?: string;
}) {
  const pool = getPool();
  const { hashPassword, isAdminEmail } = await import("./auth");
  const passwordHash = await hashPassword(opts.password);
  const isAdmin = isAdminEmail(opts.email);

  const { rows: users } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name`,
    [opts.email, passwordHash, opts.fullName]
  );
  const user = users[0] as { id: string; email: string; full_name: string };

  await pool.query(`INSERT INTO profiles (id, full_name, email) VALUES ($1, $2, $3)`, [
    user.id,
    opts.fullName,
    opts.email,
  ]);

  const role = isAdmin ? "admin" : "owner";
  await pool.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)`, [user.id, role]);

  if (!isAdmin) {
    await pool.query(`INSERT INTO owners (user_id, name, email, contact) VALUES ($1, $2, $3, $4)`, [
      user.id,
      opts.fullName,
      opts.email,
      opts.contact ?? null,
    ]);
  }

  return { id: user.id, email: user.email, fullName: user.full_name, role: role as "admin" | "owner" };
}

export async function loginUser(email: string, password: string) {
  const pool = getPool();
  const { verifyPassword } = await import("./auth");

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.password_hash, ur.role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.email = $1
     ORDER BY ur.role ASC`,
    [email]
  );

  if (!rows.length) return null;
  const user = rows[0] as {
    id: string;
    email: string;
    full_name: string;
    password_hash: string;
    role: "admin" | "owner" | null;
  };

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;

  const role = rows.some((r: { role: string }) => r.role === "admin") ? "admin" : (user.role ?? "owner");

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: role as "admin" | "owner",
  };
}
