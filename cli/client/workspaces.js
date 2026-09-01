import { asItem, asList } from "./helpers.js";

const WORKSPACE_FIELDS = "id,apiName,displayName,description,primaryColor,logoId";

export const listWorkspaces = async (session) =>
  asList(await session.api("/system/workspaces", { query: { fields: WORKSPACE_FIELDS } }));

export const createWorkspace = async (session, { apiName, displayName }) =>
  asItem(
    await session.api("/system/workspaces", {
      method: "POST",
      body: { apiName, displayName },
    }),
  );

export const updateWorkspace = async (session, apiName, patch) =>
  asItem(await session.api(`/system/workspaces/${apiName}`, { method: "PATCH", body: patch }));
