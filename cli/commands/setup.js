import { configureAi } from "../app/ai.js";
import { ensureSource } from "../app/source.js";
import { ensureWorkspace } from "../app/workspace.js";
import { createClient } from "../client/index.js";
import { toClientInput } from "../lib/env.js";
import { addAiOptions } from "./ai.js";
import {
  addBaseOptions,
  addBenefitsDatabaseOptions,
  addFullNameOption,
  addSourceOption,
  addWorkspaceNameOption,
  addWorkspaceOption,
  applyOptionSets,
  withCommandErrorHandling,
} from "./common.js";

const SCRIPT_NAME = "monospace-cli";
const COMMAND_NAME = "setup";
const COMMAND_DESCRIPTION = "Create the admin, workspace, benefits data source, and introspect";

const builder = (cmd) =>
  addAiOptions(
    applyOptionSets(
      cmd,
      addBaseOptions,
      addFullNameOption,
      addWorkspaceOption,
      addWorkspaceNameOption,
      addSourceOption,
      addBenefitsDatabaseOptions,
    ),
  );

const printResult = (result) => {
  console.log(`url         ${result.url}`);
  console.log(`user        ${result.email}`);
  console.log(`workspace   ${result.workspace}${result.workspaceCreated ? "  created" : ""}`);
  console.log(`source      ${result.source}  ${result.sourceId}${result.sourceCreated ? "  created" : ""}`);
  console.log(`introspect  ${result.changes} change(s)`);
  if (result.ai?.skipped) {
    console.log("ai          skipped (no MONOSPACE_AI_API_KEY)");
  } else if (result.ai) {
    console.log(`ai          ${result.ai.provider}  chat=${result.ai.chatModel}  fast=${result.ai.fastModel}`);
  }
};

const handler = withCommandErrorHandling(async (argv) => {
  const input = toClientInput(argv);
  const client = createClient(input);
  
  const { workspace, created: workspaceCreated } = await ensureWorkspace(client, input);
  const { source, created: sourceCreated } = await ensureSource(client, input);
  
  if (!source?.id) throw new Error("Data source id missing after create/list");
  
  const changes = await client.introspectSource(input.workspace, source.id);
  
  const ai = await configureAi(client, input);
  
  printResult({
    url: client.base,
    email: client.user?.email || input.email,
    workspace: workspace?.apiName || input.workspace,
    workspaceCreated,
    source: source.apiName,
    sourceId: source.id,
    sourceCreated,
    changes,
    ai,
  });
});

export const registerSetupCommand = (yargs) =>
  yargs.scriptName(SCRIPT_NAME).command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
