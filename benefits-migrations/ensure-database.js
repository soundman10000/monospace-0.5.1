import pg from "pg";
import { ADMIN_DATABASE_URL, DATABASE_URL } from "./knexfile.js";

const target = new URL(DATABASE_URL);
const databaseName = decodeURIComponent(target.pathname.replace(/^\//, ""));
if (!databaseName) {
  throw new Error("DATABASE_URL must include a database name");
}

const admin = new pg.Client({ connectionString: ADMIN_DATABASE_URL });
await admin.connect();
try {
  const result = await admin.query(
    "select 1 from pg_database where datname = $1",
    [databaseName]
  );
  if (result.rowCount === 0) {
    await admin.query(`create database ${quoteIdent(databaseName)}`);
    console.log(`created database ${databaseName}`);
  }
} finally {
  await admin.end();
}

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
