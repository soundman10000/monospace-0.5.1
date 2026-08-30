import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { FsMigrations } = require("knex/lib/migrations/migrate/sources/fs-migrations.js");

export class TimestampMigrationSource extends FsMigrations {
  async getMigrations(loadExtensions) {
    const migrations = await super.getMigrations(loadExtensions);
    return migrations.filter((migration) => /^\d+[-_]/.test(migration.file));
  }
}
