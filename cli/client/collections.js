import { asItem, asList } from "./helpers.js";

const COLLECTION_FIELDS = "id,apiName,dbName,sourceId,meta.isHidden";
const META_FIELDS = "collectionId,isHidden";

export const listCollections = async (session, workspace, { sourceId } = {}) =>
  asList(
    await session.api(`/${workspace}/items/MonospaceCollection`, {
      query: {
        fields: COLLECTION_FIELDS,
        limit: -1,
        ...(sourceId ? { "filter[sourceId][_eq]": sourceId } : {}),
      },
    }),
  );

const metaBody = (collectionId, overlay) => ({
  collection: { _connect: { key: { id: collectionId } } },
  ...overlay,
});

export const createCollectionMeta = async (session, workspace, items) => {
  if (!items.length) return [];
  const body = items.map(({ collectionId, overlay }) => metaBody(collectionId, overlay));
  return asList(
    await session.api(`/${workspace}/items/MonospaceCollectionMeta`, {
      method: "POST",
      query: { fields: META_FIELDS },
      body: body.length === 1 ? body[0] : body,
    }),
  );
};

export const updateCollectionMeta = async (session, workspace, collectionId, overlay) =>
  asItem(
    await session.api(`/${workspace}/items/MonospaceCollectionMeta/${collectionId}`, {
      method: "PATCH",
      query: { fields: META_FIELDS },
      body: overlay,
    }),
  );
