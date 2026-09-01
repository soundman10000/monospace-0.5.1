import { bindOperation, loadSchema } from "../lib/schema.js";

const hasRelation = (relations, field) =>
  relations.some(
    (relation) =>
      relation.apiName === field.apiName &&
      (relation.collection.dbName === field.collectionId || relation.collection.apiName === field.collectionId),
  );

export const applySchema = async (client, { workspace, path }) => {
  const schema = await loadSchema(path);
  const collections = await client.listCollections(workspace);
  const primitives = await client.listPrimitiveFields(workspace);
  const relations = await client.listRelationFields(workspace);
  let created = 0;
  let skipped = 0;

  for (const operation of schema.operations) {
    const { firstField, secondField } = operation.data.data;
    if (hasRelation(relations, firstField) && hasRelation(relations, secondField)) {
      skipped += 1;
      continue;
    }

    const bound = bindOperation(operation, { collections, primitives });
    await client.migrateSchema(workspace, [bound]);
    created += 1;
    if (firstField.meta) {
      await client.createRelationFieldMeta(workspace, bound.data.data.firstField.id, firstField.meta);
    }
    if (secondField.meta) {
      await client.createRelationFieldMeta(workspace, bound.data.data.secondField.id, secondField.meta);
    }
  }

  return {
    file: schema.file,
    operations: schema.operations.length,
    created,
    skipped,
  };
};
