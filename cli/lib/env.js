import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CLI_ROOT = path.join(ROOT, "cli");

dotenv.config({ path: path.join(ROOT, ".env") });
dotenv.config({ path: path.join(CLI_ROOT, ".env") });

export const AI_PROVIDERS = ["openai", "anthropic"];

const openaiModels = {
  chatModel: "gpt-5.4",
  fastModel: "o4-mini",
  chatReasoningEnabled: true,
  chatReasoningLevel: "medium",
};

const firstEnv = (...names) => names.map((name) => process.env[name]).find((value) => value) || "";

export const defaults = {
  url: firstEnv("MONOSPACE_URL") || "http://localhost:8100",
  apiKey: firstEnv("MONOSPACE_API_KEY"),
  email: firstEnv("MONOSPACE_BOOTSTRAP_EMAIL") || "admin@benefitsgo.tech",
  password: firstEnv("MONOSPACE_BOOTSTRAP_PASSWORD") || "Empyrean1",
  fullName: firstEnv("MONOSPACE_BOOTSTRAP_NAME") || "Admin",
  aiProvider: firstEnv("MONOSPACE_AI_PROVIDER") || "openai",
  aiApiKey: firstEnv("MONOSPACE_AI_API_KEY", "MONOSPACE_AI_OPEN_AI_KEY"),
  aiChatModel: firstEnv("MONOSPACE_AI_CHAT_MODEL") || openaiModels.chatModel,
  aiFastModel: firstEnv("MONOSPACE_AI_FAST_MODEL") || openaiModels.fastModel,
  aiReasoning: process.env.MONOSPACE_AI_REASONING === "false" ? false : openaiModels.chatReasoningEnabled,
  aiReasoningLevel: firstEnv("MONOSPACE_AI_REASONING_LEVEL") || openaiModels.chatReasoningLevel,
};

export const toClientInput = (argv) => ({
  url: argv.url || defaults.url,
  apiKey: argv.apiKey || defaults.apiKey,
  email: argv.email || defaults.email,
  password: argv.password || defaults.password,
  fullName: argv.fullName || defaults.fullName,
  workspace: argv.workspace,
  workspaceName: argv.workspaceName || argv.workspace,
  source: argv.source,
  host: argv.host,
  port: argv.port,
  user: argv.user,
  dbPassword: argv.dbPassword,
  dbname: argv.dbname,
  aiProvider: argv.aiProvider || defaults.aiProvider,
  aiApiKey: argv.aiApiKey || defaults.aiApiKey,
  aiChatModel: argv.aiChatModel || defaults.aiChatModel,
  aiFastModel: argv.aiFastModel || defaults.aiFastModel,
  aiReasoning: argv.aiReasoning ?? defaults.aiReasoning,
  aiReasoningLevel: argv.aiReasoningLevel || defaults.aiReasoningLevel,
});
