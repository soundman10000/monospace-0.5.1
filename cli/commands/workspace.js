import { configureAi } from "../app/ai.js";
import { ensureWorkspace } from "../app/workspace.js";
import { createClient } from "../client/index.js";
import { addAiOptions, aiFromArgv } from "./ai.js";
import {
  addBaseOptions,
  addFullNameOption,
  addWorkspaceNameOption,
  addWorkspaceOption,
  applyOptionSets,
  authFromArgv,
  printAuth,
  withCommandErrorHandling,
} from "./common.js";

const COMMAND_NAME = "workspace";
const COMMAND_DESCRIPTION =
  "Create a workspace by name and apply the shared Assistant key (Settings → AI)";

const builder = (cmd) =>
  addAiOptions(
    applyOptionSets(cmd, addBaseOptions, addFullNameOption, addWorkspaceOption, addWorkspaceNameOption),
  )
    .option("description", {
      type: "string",
      describe: "Workspace description",
    })
    .option("color", {
      type: "string",
      describe: "Workspace brand color as hex (for example #0077b7)",
    })
    .option("logo", {
      type: "string",
      describe: "Path to a workspace logo image (uploaded as a system asset)",
    });

const printAi = (ai) => {
  if (ai?.skipped) {
    console.log("ai          skipped (no MONOSPACE_AI_API_KEY; shared across workspaces)");
    return;
  }
  if (ai) {
    console.log(`ai          ${ai.provider}  chat=${ai.chatModel}  fast=${ai.fastModel}`);
  }
};

const printResult = (result) => {
  printAuth(result.client);
  console.log(`url         ${result.url}`);
  console.log(`user        ${result.email}`);
  console.log(`workspace   ${result.workspace}${result.workspaceCreated ? "  created" : ""}`);
  console.log(`display     ${result.displayName}`);
  if (result.description) console.log(`description ${result.description}`);
  if (result.color) console.log(`color       ${result.color}`);
  if (result.logoId) console.log(`logo        ${result.logoId}`);
  printAi(result.ai);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const { workspace, created } = await ensureWorkspace(client, {
    apiName: argv.workspace,
    displayName: argv.workspaceName || argv.workspace,
    description: argv.description,
    color: argv.color,
    logo: argv.logo,
  });
  const ai = await configureAi(client, argv.workspace, aiFromArgv(argv));

  printResult({
    client,
    url: client.base,
    email: client.user?.email || argv.email,
    workspace: workspace?.apiName || argv.workspace,
    displayName: workspace?.displayName || argv.workspaceName || argv.workspace,
    description: workspace?.description,
    color: workspace?.primaryColor,
    logoId: workspace?.logoId,
    workspaceCreated: created,
    ai,
  });
});

export const registerWorkspaceCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
