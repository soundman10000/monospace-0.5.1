import { asItem, asList } from "./helpers.js";

const WORKSPACE_FIELDS = "id,apiName,displayName,description,primaryColor,logoId";

export const listWorkspaces = async (session) =>
  asList(await session.api("/system/workspaces", { query: { fields: WORKSPACE_FIELDS } }));

export const createWorkspace = async (session, { apiName, displayName, description, primaryColor }) => {
  const payload = { apiName, displayName };
  if (description) payload.description = description;
  if (primaryColor) payload.primaryColor = primaryColor;
  try {
    return asItem(await session.api("/system/workspaces", { method: "POST", body: payload }));
  } catch {
    return asItem(await session.api("/system/workspaces", { method: "POST", body: [payload] }));
  }
};

export const updateWorkspace = async (session, apiName, patch) =>
  asItem(await session.api(`/system/workspaces/${apiName}`, { method: "PATCH", body: patch }));
