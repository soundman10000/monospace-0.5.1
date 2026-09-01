import { toClientInput } from "../lib/env.js";
import { introspect } from "../app/source.js";
import { addBaseOptions, addSourceOption, addWorkspaceOption, applyOptionSets, withCommandErrorHandling } from "./common.js";

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
  const result = await introspect(toClientInput(argv));
  printResult(result);
});

export const registerIntrospectCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
