import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Pool } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "db", "schema.sql");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.");
    process.exit(1);
  }

  const sql = readFileSync(schemaPath, "utf-8");
  const pool = new Pool({ connectionString: url });
  await pool.query(sql);
  await pool.end();
  console.log("Schema applied successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
