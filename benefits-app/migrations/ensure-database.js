import pg from "pg";
import { ADMIN_DATABASE_URL, DATABASE_URL, MIGRATIONS_SCHEMA } from "./knexfile.js";

const databaseName = decodeURIComponent(new URL(DATABASE_URL).pathname.replace(/^\//, ""));
const ident = (value) => `"${String(value).replace(/"/g, '""')}"`;

const admin = new pg.Client({ connectionString: ADMIN_DATABASE_URL });
await admin.connect();
try {
  const { rowCount } = await admin.query("select 1 from pg_database where datname = $1", [databaseName]);
  if (rowCount === 0) {
    await admin.query(`create database ${ident(databaseName)}`);
  }
} finally {
  await admin.end();
}

const db = new pg.Client({ connectionString: DATABASE_URL });
await db.connect();
try {
  await db.query(`create schema if not exists ${ident(MIGRATIONS_SCHEMA)}`);
} finally {
  await db.end();
}
