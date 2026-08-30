import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const VERSION_TABLE = "schema_migrations";

loadDotEnv(path.join(__dirname, ".env"));

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:monospace@localhost:5434/benefits";
const ADMIN_DATABASE_URL =
  process.env.ADMIN_DATABASE_URL ||
  DATABASE_URL.replace(/\/[^/]+$/, "/postgres");

const command = process.argv[2] || "up";
const countArg = Number.parseInt(process.argv[3] ?? "", 10);
const count = Number.isFinite(countArg) && countArg > 0 ? countArg : null;

try {
  if (command === "up") {
    await ensureDatabase();
    await withClient(DATABASE_URL, (client) => migrateUp(client, count));
  } else if (command === "down") {
    await withClient(DATABASE_URL, (client) => migrateDown(client, count ?? 1));
  } else if (command === "status") {
    await withClient(DATABASE_URL, status);
  } else if (command === "redo") {
    await withClient(DATABASE_URL, async (client) => {
      await migrateDown(client, 1);
      await migrateUp(client, 1);
    });
  } else {
    printUsage();
    process.exit(1);
  }
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

function printUsage() {
  console.log(`Usage:
  node migrate.js up [n]
  node migrate.js down [n]
  node migrate.js status
  node migrate.js redo`);
}

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

async function ensureDatabase() {
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
}

async function withClient(connectionString, work) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await work(client);
  } finally {
    await client.end();
  }
}

async function ensureVersionTable(client) {
  await client.query(`
    create table if not exists ${VERSION_TABLE} (
      version varchar(32) not null,
      name text not null,
      applied_on timestamptz not null default now(),
      constraint pk_schema_migrations primary key (version)
    )
  `);
}

function readMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      if (!match) {
        throw new Error(
          `Migration file ${file} must be named {version}_{description}.sql`
        );
      }

      const text = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      return {
        version: match[1],
        name: match[2],
        file,
        up: section(text, "up"),
        down: section(text, "down"),
      };
    });
}

function section(text, kind) {
  const upIndex = text.search(/--\s*migrate:up\b/i);
  const downIndex = text.search(/--\s*migrate:down\b/i);

  if (upIndex < 0) {
    return kind === "up" ? text.trim() : "";
  }

  if (kind === "up") {
    const end = downIndex < 0 ? text.length : downIndex;
    return text
      .slice(upIndex, end)
      .replace(/--\s*migrate:up\b/i, "")
      .trim();
  }

  if (downIndex < 0) {
    return "";
  }

  return text.slice(downIndex).replace(/--\s*migrate:down\b/i, "").trim();
}

async function appliedVersions(client) {
  await ensureVersionTable(client);
  const result = await client.query(
    `select version, name, applied_on from ${VERSION_TABLE} order by version`
  );
  return result.rows;
}

async function migrateUp(client, limit) {
  const applied = new Set((await appliedVersions(client)).map((row) => row.version));
  let pending = readMigrations().filter((migration) => !applied.has(migration.version));
  if (limit != null) {
    pending = pending.slice(0, limit);
  }

  if (pending.length === 0) {
    console.log("no pending migrations");
    return;
  }

  for (const migration of pending) {
    if (!migration.up) {
      throw new Error(`${migration.file} has no migrate:up section`);
    }

    await client.query("begin");
    try {
      await client.query(migration.up);
      await client.query(
        `insert into ${VERSION_TABLE} (version, name) values ($1, $2)`,
        [migration.version, migration.name]
      );
      await client.query("commit");
      console.log(`applied ${migration.file}`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`failed ${migration.file}: ${error.message}`);
    }
  }
}

async function migrateDown(client, limit) {
  const applied = await appliedVersions(client);
  const files = new Map(readMigrations().map((migration) => [migration.version, migration]));
  const toRevert = applied.slice(-limit).reverse();

  if (toRevert.length === 0) {
    console.log("no applied migrations to revert");
    return;
  }

  for (const row of toRevert) {
    const migration = files.get(row.version);
    if (!migration) {
      throw new Error(`applied version ${row.version} has no matching file`);
    }
    if (!migration.down) {
      throw new Error(`${migration.file} has no migrate:down section`);
    }

    await client.query("begin");
    try {
      await client.query(migration.down);
      await client.query(`delete from ${VERSION_TABLE} where version = $1`, [
        migration.version,
      ]);
      await client.query("commit");
      console.log(`reverted ${migration.file}`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`failed ${migration.file}: ${error.message}`);
    }
  }
}

async function status(client) {
  const applied = await appliedVersions(client);
  const appliedMap = new Map(applied.map((row) => [row.version, row]));

  for (const migration of readMigrations()) {
    const row = appliedMap.get(migration.version);
    if (row) {
      console.log(
        `  applied  ${migration.file}  ${row.applied_on.toISOString()}`
      );
    } else {
      console.log(`  pending  ${migration.file}`);
    }
  }
}

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
