import { asList, connect, unwrap } from "../client/index.js";

const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

const ensureNamed = async ({ list, match, create }) => {
  const existing = firstByApiName(await list(), match);
  
  if (existing) return { item: existing, created: false };
  
  return { item: unwrap(await create()), created: true };
};

const listSources = async (client, workspace) =>
  asList(
    await client.workspaceClient(workspace).$readMany("MonospaceDataSource", {
      fields: ["id", "apiName", "provider", "preset"],
    }),
  );

const sourceBody = (input) => ({
  apiName: input.source,
  provider: "postgres",
  host: input.host,
  port: input.port,
  user: input.user,
  password: input.dbPassword,
  dbname: input.dbname,
  ssl: { mode: "disable" },
});

export const ensureSource = (client, input) =>
  ensureNamed({
    match: input.source,
    list: () => listSources(client, input.workspace),
    create: () => client.api(`/${input.workspace}/sources/data`, { method: "POST", body: sourceBody(input) }),
  })
  .then(({ item, created }) => ({ source: item, created }));

const changeCount = (data) => {
  const ops = unwrap(data);
  if (Array.isArray(ops)) return ops.length;
  
  return ops?.operations?.length ?? 0;
};

export const introspectSource = async (client, { workspace, sourceId }) =>
  changeCount(await client.api(`/${workspace}/schema/introspect/${sourceId}`, { method: "POST" }));

export const findSource = async (client, input) => {
  const source = firstByApiName(await listSources(client, input.workspace), input.source);
  
  if (!source?.id) {
    throw new Error(`Data source ${input.source} not found in ${input.workspace}`);
  }
  
  return source;
};

export const introspect = async (input) => {
  const client = await connect(input);
  const source = await findSource(client, input);
  const changes = await introspectSource(client, { workspace: input.workspace, sourceId: source.id });
  return {
    url: client.base,
    workspace: input.workspace,
    source: source.apiName,
    sourceId: source.id,
    changes,
  };
};
