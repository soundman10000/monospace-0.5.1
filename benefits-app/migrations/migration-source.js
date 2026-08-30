import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { FsMigrations } = require("knex/lib/migrations/migrate/sources/fs-migrations.js");

export const MIGRATION_SEPARATOR = "-";

export const parseMigrationFilename = (file) => {
  const items = String(file).split(MIGRATION_SEPARATOR);
  const id = items[0];
  const name = items.slice(1).join(MIGRATION_SEPARATOR);
  if (!/^\d+$/.test(id) || !name) {
    return null;
  }
  return { id: Number(id), name, file };
};

export class TimestampMigrationSource extends FsMigrations {
  async getMigrations(loadExtensions) {
    const migrations = await super.getMigrations(loadExtensions);
    return migrations.filter((migration) => parseMigrationFilename(migration.file));
  }

  getMigrationName(migration) {
    return parseMigrationFilename(migration.file)?.name ?? migration.file;
  }
}
