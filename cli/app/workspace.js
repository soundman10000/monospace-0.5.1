import { asList, unwrap } from "../client/index.js";

const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

const ensureNamed = async ({ list, match, create }) => {
  const existing = firstByApiName(await list(), match);
  if (existing) return { item: existing, created: false };
  
  return { 
    item: unwrap(await create()),
    created: true 
  };
};

const listWorkspaces = async (client) =>
  asList(await client.api("/system/workspaces", { query: { fields: "id,apiName,displayName" } }));

const listClientWorkspaces = (client) => () => listWorkspaces(client);

const createWorkspacePayload = (input) => ({
  displayName: input.workspaceName,
  apiName: input.workspace,
});

const createWorkspace = async (client, input) => {
  const payload = createWorkspacePayload(input);
  try {
    return await client.api("/system/workspaces", { method: "POST", body: payload });
  } catch {
    return client.api("/system/workspaces", { method: "POST", body: [payload] });
  }
};

const toEnsureWorkspaceResult = ({ item, created }) => ({ workspace: item, created });

export const ensureWorkspace = (client, input) =>
  ensureNamed({
    match: input.workspace,
    list: listClientWorkspaces(client),
    create: () => createWorkspace(client, input),
  }).then(toEnsureWorkspaceResult);
