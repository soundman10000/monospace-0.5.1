const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const findWorkspace = async (client, apiName) => {
  const workspace = firstByApiName(await client.listWorkspaces(), apiName);
  if (!workspace) {
    throw new Error(`Workspace ${apiName} not found`);
  }
  return workspace;
};

export const ensureWorkspace = async (client, { apiName, displayName }) => {
  const existing = firstByApiName(await client.listWorkspaces(), apiName);
  if (existing) return { workspace: existing, created: false };

  const workspace = await client.createWorkspace({
    apiName,
    displayName: displayName || apiName,
  });

  return { workspace, created: true };
};
