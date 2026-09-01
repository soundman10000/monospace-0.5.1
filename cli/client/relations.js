import { asItem } from "./helpers.js";

const META_FIELDS = "fieldId,displayName,isHidden";

export const createRelationFieldMeta = async (session, workspace, fieldId, overlay) =>
  asItem(
    await session.api(`/${workspace}/items/MonospaceSingleRelationFieldMeta`, {
      method: "POST",
      query: { fields: META_FIELDS },
      body: {
        field: { _connect: { key: { id: fieldId } } },
        isHidden: overlay.isHidden ?? false,
        ...overlay,
      },
    }),
  );

export const updateRelationFieldMeta = async (session, workspace, fieldId, overlay) =>
  asItem(
    await session.api(`/${workspace}/items/MonospaceSingleRelationFieldMeta/${fieldId}`, {
      method: "PATCH",
      query: { fields: META_FIELDS },
      body: overlay,
    }),
  );
