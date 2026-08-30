import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotEnv(path.join(__dirname, ".env"));

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:monospace@localhost:5434/benefits";

export const ADMIN_DATABASE_URL =
  process.env.ADMIN_DATABASE_URL ||
  DATABASE_URL.replace(/\/[^/]+$/, "/postgres");

/** @type {import('knex').Knex.Config} */
const config = {
  client: "pg",
  connection: DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, "migrations"),
    extension: "js",
    loadExtensions: [".js"],
    tableName: "knex_migrations",
  },
};

export default config;

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}
