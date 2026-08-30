import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { TimestampMigrationSource } from "./migration-source.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:monospace@localhost:5434/benefits";

export const ADMIN_DATABASE_URL =
  process.env.ADMIN_DATABASE_URL ||
  DATABASE_URL.replace(/\/[^/]+$/, "/postgres");

export const MIGRATIONS_SCHEMA = "benefits";
export const MIGRATIONS_TABLE = "knex_migrations";

/** @type {import('knex').Knex.Config} */
const config = {
  client: "pg",
  connection: DATABASE_URL,
  migrations: {
    schemaName: MIGRATIONS_SCHEMA,
    tableName: MIGRATIONS_TABLE,
    disableTransactions: true,
    migrationSource: new TimestampMigrationSource(__dirname),
  },
};

export default config;
