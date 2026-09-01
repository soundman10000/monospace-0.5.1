import { asItem, asList } from "./helpers.js";

const WORKSPACE_FIELDS = "id,apiName,displayName";

export const listWorkspaces = async (session) =>
  asList(await session.api("/system/workspaces", { query: { fields: WORKSPACE_FIELDS } }));

export const createWorkspace = async (session, { apiName, displayName }) => {
  const payload = { displayName, apiName };
  try {
    return asItem(await session.api("/system/workspaces", { method: "POST", body: payload }));
  } catch {
    return asItem(await session.api("/system/workspaces", { method: "POST", body: [payload] }));
  }
};
