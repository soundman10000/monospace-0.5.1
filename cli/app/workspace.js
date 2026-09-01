const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const ensureWorkspace = async (client, input) => {
  const existing = firstByApiName(await client.listWorkspaces(), input.workspace);
  if (existing) return { workspace: existing, created: false };

  const workspace = await client.createWorkspace({
    apiName: input.workspace,
    displayName: input.workspaceName,
  });

  return { workspace, created: true };
};
