import { findSource } from "../app/source.js";
import { createClient } from "../client/index.js";
import {
  addBaseOptions,
  addSourceOption,
  addWorkspaceOption,
  applyOptionSets,
  authFromArgv,
  withCommandErrorHandling,
} from "./common.js";

const COMMAND_NAME = "introspect";
const COMMAND_DESCRIPTION = "Re-introspect a data source into the workspace";

const builder = (cmd) => applyOptionSets(cmd, addBaseOptions, addWorkspaceOption, addSourceOption);

const printResult = (result) => {
  console.log(`url         ${result.url}`);
  console.log(`workspace   ${result.workspace}`);
  console.log(`source      ${result.source}  ${result.sourceId}`);
  console.log(`introspect  ${result.changes} change(s)`);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const source = await findSource(client, argv.workspace, argv.source);
  const changes = await client.introspectSource(argv.workspace, source.id);

  printResult({
    url: client.base,
    workspace: argv.workspace,
    source: source.apiName,
    sourceId: source.id,
    changes,
  });
});

export const registerIntrospectCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
