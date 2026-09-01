import { AI_PROVIDERS, defaults, toClientInput } from "../lib/env.js";
import { configureWorkspaceAi } from "../app/ai.js";
import { addBaseOptions, addWorkspaceOption, applyOptionSets, withCommandErrorHandling } from "./common.js";

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
  const result = await configureWorkspaceAi(toClientInput(argv));
  printResult(result);
});

export const registerAiCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
