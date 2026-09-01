import { attachSource } from "../app/source.js";
import { findWorkspace } from "../app/workspace.js";
import { createClient } from "../client/index.js";
import {
  addBaseOptions,
  addSourceDatabaseOptions,
  addSourceOption,
  addWorkspaceOption,
  applyOptionSets,
  authFromArgv,
  printAuth,
  withCommandErrorHandling,
} from "./common.js";

const COMMAND_NAME = "source";
const COMMAND_DESCRIPTION =
  "Add a Postgres data source to a workspace and introspect it";

const builder = (cmd) =>
  applyOptionSets(cmd, addBaseOptions, addWorkspaceOption, addSourceOption, addSourceDatabaseOptions);

const printResult = (result) => {
  printAuth(result.client);
  console.log(`url         ${result.url}`);
  console.log(`workspace   ${result.workspace}`);
  console.log(`source      ${result.source}  ${result.sourceId}${result.sourceCreated ? "  created" : ""}`);
  console.log(`introspect  ${result.changes} change(s)`);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const workspace = await findWorkspace(client, argv.workspace);
  const { source, created, changes } = await attachSource(client, {
    workspace: argv.workspace,
    apiName: argv.source,
    host: argv.host,
    port: argv.port,
    user: argv.user,
    password: argv.dbPassword,
    dbname: argv.dbname,
  });

  printResult({
    client,
    url: client.base,
    workspace: workspace?.apiName || argv.workspace,
    source: source.apiName,
    sourceId: source.id,
    sourceCreated: created,
    changes,
  });
});

export const registerSourceCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
