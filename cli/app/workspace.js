const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const findWorkspace = async (client, input) => {
  const workspace = firstByApiName(await client.listWorkspaces(), input.workspace);
  if (!workspace) {
    throw new Error(`Workspace ${input.workspace} not found`);
  }
  return workspace;
};

export const ensureWorkspace = async (client, input) => {
  const existing = firstByApiName(await client.listWorkspaces(), input.workspace);
  if (existing) return { workspace: existing, created: false };

  const workspace = await client.createWorkspace({
    apiName: input.workspace,
    displayName: input.workspaceName || input.workspace,
  });

  return { workspace, created: true };
};
