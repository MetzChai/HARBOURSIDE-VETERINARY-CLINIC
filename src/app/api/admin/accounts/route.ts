import { NextResponse } from "next/server";
import { getSession, hashPassword, isAdminEmail } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.google_id, u.created_at,
            COALESCE(
              (SELECT role::text FROM user_roles WHERE user_id = u.id ORDER BY role LIMIT 1),
              'owner'
            ) AS role
     FROM users u
     ORDER BY u.created_at DESC`
  );

  return NextResponse.json({ accounts: rows });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, password, fullName, role, contact } = await request.json();
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Email, password, name, and role are required." }, { status: 400 });
    }
    if (!["admin", "owner"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const pool = getPool();
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const effectiveRole = role === "admin" || isAdminEmail(email) ? "admin" : "owner";

    const { rows: users } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name`,
      [email, passwordHash, fullName]
    );
    const newUser = users[0] as { id: string; email: string; full_name: string };

    await pool.query(`INSERT INTO profiles (id, full_name, email) VALUES ($1, $2, $3)`, [
      newUser.id, fullName, email,
    ]);
    await pool.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)`, [
      newUser.id, effectiveRole,
    ]);

    if (effectiveRole === "owner") {
      await pool.query(`INSERT INTO owners (user_id, name, email, contact) VALUES ($1, $2, $3, $4)`, [
        newUser.id, fullName, email, contact ?? null,
      ]);
    }

    return NextResponse.json({
      account: { id: newUser.id, email: newUser.email, full_name: fullName, role: effectiveRole },
    });
  } catch (e) {
    console.error("create account error:", e);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, role, fullName, password } = await request.json();
    if (!id) return NextResponse.json({ error: "Account ID required." }, { status: 400 });

    const pool = getPool();

    if (fullName) {
      await pool.query(`UPDATE users SET full_name = $1 WHERE id = $2`, [fullName, id]);
      await pool.query(`UPDATE profiles SET full_name = $1 WHERE id = $2`, [fullName, id]);
    }

    if (password && password.length >= 6) {
      const passwordHash = await hashPassword(password);
      await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);
    }

    if (role && ["admin", "owner"].includes(role)) {
      await pool.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
      await pool.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)`, [id, role]);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("update account error:", e);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Account ID required." }, { status: 400 });
    if (id === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("delete account error:", e);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
