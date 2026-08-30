import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";
import { applyDiff } from "@directus/api/utils/apply-diff";
import { getSnapshot } from "@directus/api/utils/get-snapshot";
import { getSchema } from "@directus/api/utils/get-schema";
import { flushCaches } from "@directus/api/cache";

const filePath = (filename) => join("/directus", "migrations", filename);

export const loadSnapshot = async (filename) => {
  const contents = await readFile(filePath(filename), "utf8");
  return loadYaml(contents);
};

const emptyDiff = {
  collections: [],
  fields: [],
  relations: [],
  systemFields: [],
};

const normalizeDiff = (diff) => ({
  ...emptyDiff,
  ...diff,
  collections: diff?.collections ?? [],
  fields: diff?.fields ?? [],
  relations: diff?.relations ?? [],
  systemFields: diff?.systemFields ?? [],
});

export const applySnapshotDiff = async (knex, filename) => {
  const diff = normalizeDiff(await loadSnapshot(filename));
  const schema = await getSchema({ database: knex, bypassCache: true });
  const current = await getSnapshot({ database: knex, schema });
  await applyDiff(current, diff, { database: knex, schema });
  await flushCaches();
};
