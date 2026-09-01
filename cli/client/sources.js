import { asItem, asList, unwrap } from "./helpers.js";

const SOURCE_FIELDS = "id,apiName,provider,preset";

const sourceBody = ({ apiName, host, port, user, password, dbname }) => ({
  apiName,
  provider: "postgres",
  host,
  port,
  user,
  password,
  dbname,
  ssl: { mode: "disable" },
});

const changeCount = (data) => {
  const ops = unwrap(data);
  if (Array.isArray(ops)) return ops.length;
  return ops?.operations?.length ?? 0;
};

export const listSources = async (session, workspace) =>
  asList(
    await session.api(`/${workspace}/items/MonospaceDataSource`, {
      query: { fields: SOURCE_FIELDS },
    }),
  );

export const createSource = async (session, workspace, source) =>
  asItem(
    await session.api(`/${workspace}/sources/data`, {
      method: "POST",
      body: sourceBody(source),
    }),
  );

export const introspectSource = async (session, workspace, sourceId) =>
  changeCount(await session.api(`/${workspace}/schema/introspect/${sourceId}`, { method: "POST" }));
