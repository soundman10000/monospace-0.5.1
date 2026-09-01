import { asList } from "./helpers.js";

const PRIMITIVE_FIELDS = "id,apiName,dbName,collectionId,collection.dbName";
const RELATION_FIELDS =
  "id,apiName,isList,collectionId,collection.dbName,meta.displayName,meta.isHidden";

export const listPrimitiveFields = async (session, workspace) =>
  asList(
    await session.api(`/${workspace}/items/MonospacePrimitiveField`, {
      query: { fields: PRIMITIVE_FIELDS, limit: -1 },
    }),
  );

export const listRelationFields = async (session, workspace) =>
  asList(
    await session.api(`/${workspace}/items/MonospaceSingleRelationField`, {
      query: { fields: RELATION_FIELDS, limit: -1 },
    }),
  );
