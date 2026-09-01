import { loadStrategy } from "../lib/strategy.js";

const overlayChanged = (meta, overlay) =>
  Object.entries(overlay).some(([key, value]) => (meta?.[key] ?? null) !== value);

export const applySourceStrategy = async (client, { workspace, source, path }) => {
  const strategy = await loadStrategy(path);
  const collections = await client.listCollections(workspace, { sourceId: source.id });
  const byDbName = new Map(collections.map((collection) => [collection.dbName, collection]));
  const created = [];
  const updated = [];
  let unchanged = 0;

  for (const { dbName, overlay } of strategy.collections) {
    const collection = byDbName.get(dbName);
    if (!collection) {
      throw new Error(`Strategy ${strategy.file} collection ${dbName} not found in ${source.apiName}`);
    }
    if (!overlayChanged(collection.meta, overlay)) {
      unchanged += 1;
      continue;
    }
    if (collection.meta == null) {
      created.push({ collectionId: collection.id, overlay, apiName: collection.apiName });
      continue;
    }
    updated.push({ collectionId: collection.id, overlay, apiName: collection.apiName });
  }

  if (created.length) {
    await client.createCollectionMeta(workspace, created);
  }
  for (const item of updated) {
    await client.updateCollectionMeta(workspace, item.collectionId, item.overlay);
  }

  return {
    file: strategy.file,
    matched: created.length + updated.length + unchanged,
    created: created.length,
    updated: updated.length,
    unchanged,
  };
};
