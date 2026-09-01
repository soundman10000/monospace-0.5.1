import { applySchema } from "../app/schema.js";
import { createClient } from "../client/index.js";
import {
  addBaseOptions,
  addWorkspaceOption,
  applyOptionSets,
  authFromArgv,
  printAuth,
  withCommandErrorHandling,
} from "./common.js";

const COMMAND_NAME = "schema";
const COMMAND_DESCRIPTION = "Apply a workspace overlay schema (virtual relations)";

const builder = (cmd) =>
  applyOptionSets(cmd, addBaseOptions, addWorkspaceOption).option("file", {
    type: "string",
    demandOption: true,
    describe: "Path to a name-based schema migrate JSON",
  });

const printResult = (result) => {
  printAuth(result.client);
  console.log(`url         ${result.url}`);
  console.log(`workspace   ${result.workspace}`);
  console.log(`schema      ${result.file}`);
  console.log(`operations  ${result.operations}  created ${result.created}  skipped ${result.skipped}`);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const applied = await applySchema(client, {
    workspace: argv.workspace,
    path: argv.file,
  });
  printResult({
    client,
    url: client.base,
    workspace: argv.workspace,
    ...applied,
  });
});

export const registerSchemaCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
