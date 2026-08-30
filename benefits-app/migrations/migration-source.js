import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { FsMigrations } = require("knex/lib/migrations/migrate/sources/fs-migrations.js");

export const MIGRATION_SEPARATOR = "-";

export const parseMigrationFilename = (file) => {
  const items = String(file).split(MIGRATION_SEPARATOR);
  const id = items[0];
  const name = items.slice(1).join(MIGRATION_SEPARATOR);
  if (!/^\d+$/.test(id) || !name) {
    throw new Error(`Migration file ${file} must be {id}-{name}`);
  }
  return { id: Number(id), name, file };
};

export class TimestampMigrationSource extends FsMigrations {
  async getMigrations(loadExtensions) {
    const migrations = await super.getMigrations(loadExtensions);
    return migrations.filter((migration) => {
      try {
        parseMigrationFilename(migration.file);
        return true;
      } catch {
        return false;
      }
    });
  }

  getMigrationName(migration) {
    return parseMigrationFilename(migration.file).name;
  }
}
