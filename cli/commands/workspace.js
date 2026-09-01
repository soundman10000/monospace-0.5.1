import { configureAi } from "../app/ai.js";
import { ensureWorkspace } from "../app/workspace.js";
import { createClient } from "../client/index.js";
import { toClientInput } from "../lib/env.js";
import { addAiOptions } from "./ai.js";
import {
  addBaseOptions,
  addFullNameOption,
  addWorkspaceNameOption,
  addWorkspaceOption,
  applyOptionSets,
  printAuth,
  withCommandErrorHandling,
} from "./common.js";

const COMMAND_NAME = "workspace";
const COMMAND_DESCRIPTION =
  "Create a workspace by name and apply the shared Assistant key (Settings → AI)";

const builder = (cmd) =>
  addAiOptions(
    applyOptionSets(cmd, addBaseOptions, addFullNameOption, addWorkspaceOption, addWorkspaceNameOption),
  );

const printResult = (result) => {
  printAuth(result.client);
  console.log(`url         ${result.url}`);
  console.log(`user        ${result.email}`);
  console.log(`workspace   ${result.workspace}${result.workspaceCreated ? "  created" : ""}`);
  console.log(`display     ${result.displayName}`);
  printAi(result.ai);
};

export const printAi = (ai) => {
  if (ai?.skipped) {
    console.log("ai          skipped (no MONOSPACE_AI_API_KEY; shared across workspaces)");
    return;
  }
  if (ai) {
    console.log(`ai          ${ai.provider}  chat=${ai.chatModel}  fast=${ai.fastModel}`);
  }
};

const handler = withCommandErrorHandling(async (argv) => {
  const input = toClientInput(argv);
  const client = createClient(input);
  const { workspace, created } = await ensureWorkspace(client, input);
  const ai = await configureAi(client, input);

  printResult({
    client,
    url: client.base,
    email: client.user?.email || input.email,
    workspace: workspace?.apiName || input.workspace,
    displayName: workspace?.displayName || input.workspaceName,
    workspaceCreated: created,
    ai,
  });
});

export const registerWorkspaceCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
