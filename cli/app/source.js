import { createClient } from "../client/index.js";

const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const ensureSource = async (client, input) => {
  const existing = firstByApiName(await client.listSources(input.workspace), input.source);
  if (existing) return { source: existing, created: false };

  const created = await client.createSource(input.workspace, {
    apiName: input.source,
    host: input.host,
    port: input.port,
    user: input.user,
    password: input.dbPassword,
    dbname: input.dbname,
  });

  const source =
    firstByApiName(await client.listSources(input.workspace), input.source) ||
    { ...created, apiName: input.source };

  return { source, created: true };
};

export const findSource = async (client, input) => {
  const source = firstByApiName(await client.listSources(input.workspace), input.source);
  if (!source?.id) {
    throw new Error(`Data source ${input.source} not found in ${input.workspace}`);
  }
  return source;
};

export const attachSource = async (client, input) => {
  const { source, created } = await ensureSource(client, input);
  if (!source?.id) throw new Error("Data source id missing after create/list");
  const changes = await client.introspectSource(input.workspace, source.id);
  return { source, created, changes };
};

export const introspect = async (input) => {
  const client = createClient(input);
  const source = await findSource(client, input);
  const changes = await client.introspectSource(input.workspace, source.id);
  return {
    url: client.base,
    workspace: input.workspace,
    source: source.apiName,
    sourceId: source.id,
    changes,
  };
};
