import { AI_PROVIDERS, defaults } from "../lib/env.js";
import { configureAi } from "../app/ai.js";
import { createClient } from "../client/index.js";
import { addBaseOptions, addWorkspaceOption, applyOptionSets, authFromArgv, withCommandErrorHandling } from "./common.js";

const COMMAND_NAME = "ai";
const COMMAND_DESCRIPTION = "Set the workspace Assistant provider and API key (Settings → AI)";

export const addAiOptions = (cmd) =>
  cmd
    .option("ai-provider", {
      type: "string",
      choices: AI_PROVIDERS,
      default: defaults.aiProvider,
      describe: "Assistant provider (openai or anthropic)",
    })
    .option("ai-api-key", {
      type: "string",
      default: "",
      describe: "Provider API key (MONOSPACE_AI_API_KEY; shared across workspaces)",
    })
    .option("ai-chat-model", {
      type: "string",
      default: defaults.aiChatModel,
      describe: "Chat model id",
    })
    .option("ai-fast-model", {
      type: "string",
      default: defaults.aiFastModel,
      describe: "Fast model id",
    })
    .option("ai-reasoning", {
      type: "boolean",
      default: defaults.aiReasoning,
      describe: "Enable chat reasoning",
    })
    .option("ai-reasoning-level", {
      type: "string",
      default: defaults.aiReasoningLevel,
      describe: "Chat reasoning level",
    });

export const aiFromArgv = (argv) => ({
  provider: argv.aiProvider,
  apiKey: argv.aiApiKey || defaults.aiApiKey,
  chatModel: argv.aiChatModel,
  fastModel: argv.aiFastModel,
  reasoning: argv.aiReasoning,
  reasoningLevel: argv.aiReasoningLevel,
});

const builder = (cmd) =>
  addAiOptions(
    applyOptionSets(cmd, addBaseOptions, addWorkspaceOption),
  );

const printResult = (result) => {
  console.log(`url         ${result.url}`);
  console.log(`workspace   ${result.workspace}`);
  console.log(`provider    ${result.ai.provider}`);
  console.log(`chat        ${result.ai.chatModel}`);
  console.log(`fast        ${result.ai.fastModel}`);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const ai = await configureAi(client, argv.workspace, aiFromArgv(argv));

  if (ai.skipped) throw new Error("Set MONOSPACE_AI_API_KEY or --ai-api-key");

  printResult({
    url: client.base,
    workspace: argv.workspace,
    ai,
  });
});

export const registerAiCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
