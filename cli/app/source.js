const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const findSource = async (client, workspace, apiName) => {
  const source = firstByApiName(await client.listSources(workspace), apiName);
  if (!source?.id) {
    throw new Error(`Data source ${apiName} not found in ${workspace}`);
  }
  return source;
};

export const ensureSource = async (client, { workspace, apiName, host, port, user, password, dbname }) => {
  const existing = firstByApiName(await client.listSources(workspace), apiName);
  if (existing) return { source: existing, created: false };

  const created = await client.createSource(workspace, {
    apiName,
    host,
    port,
    user,
    password,
    dbname,
  });

  const source =
    firstByApiName(await client.listSources(workspace), apiName) ||
    { ...created, apiName };

  return { source, created: true };
};

export const attachSource = async (client, input) => {
  const { source, created } = await ensureSource(client, input);
  if (!source?.id) throw new Error("Data source id missing after create/list");
  const changes = await client.introspectSource(input.workspace, source.id);
  return { source, created, changes };
};
