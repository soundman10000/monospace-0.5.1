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

export const defaults = {
  url: process.env.MONOSPACE_URL || "http://localhost:8100",
  apiKey: process.env.MONOSPACE_API_KEY || "",
  email: process.env.MONOSPACE_BOOTSTRAP_EMAIL || "admin@benefitsgo.tech",
  password: process.env.MONOSPACE_BOOTSTRAP_PASSWORD || "Empyrean1",
  fullName: process.env.MONOSPACE_BOOTSTRAP_NAME || "Admin",
  workspace: process.env.MONOSPACE_WORKSPACE || "mono-empyrean",
  workspaceName: process.env.MONOSPACE_WORKSPACE_NAME || "Mono Empyrean",
  source: process.env.MONOSPACE_SOURCE_NAME || "empyrean-benefits",
  host: process.env.BENEFITS_PGHOST || "postgres",
  port: Number(process.env.BENEFITS_PGPORT || "5432"),
  user: process.env.BENEFITS_PGUSER || "postgres",
  dbPassword: process.env.BENEFITS_PGPASSWORD || "monospace",
  dbname: process.env.BENEFITS_PGDATABASE || "benefits",
  aiProvider: process.env.MONOSPACE_AI_PROVIDER || "openai",
  aiApiKey: process.env.MONOSPACE_AI_API_KEY || "",
  aiChatModel: process.env.MONOSPACE_AI_CHAT_MODEL || openaiModels.chatModel,
  aiFastModel: process.env.MONOSPACE_AI_FAST_MODEL || openaiModels.fastModel,
  aiReasoning: process.env.MONOSPACE_AI_REASONING === "false" ? false : openaiModels.chatReasoningEnabled,
  aiReasoningLevel: process.env.MONOSPACE_AI_REASONING_LEVEL || openaiModels.chatReasoningLevel,
};

export const toClientInput = (argv) => ({
  url: argv.url || defaults.url,
  apiKey: argv.apiKey || defaults.apiKey,
  email: argv.email || defaults.email,
  password: argv.password || defaults.password,
  fullName: argv.fullName || defaults.fullName,
  workspace: argv.workspace || defaults.workspace,
  workspaceName: argv.workspaceName || defaults.workspaceName,
  source: argv.source || defaults.source,
  host: argv.host || defaults.host,
  port: argv.port ?? defaults.port,
  user: argv.user || defaults.user,
  dbPassword: argv.dbPassword || defaults.dbPassword,
  dbname: argv.dbname || defaults.dbname,
  aiProvider: argv.aiProvider || defaults.aiProvider,
  aiApiKey: argv.aiApiKey || defaults.aiApiKey,
  aiChatModel: argv.aiChatModel || defaults.aiChatModel,
  aiFastModel: argv.aiFastModel || defaults.aiFastModel,
  aiReasoning: argv.aiReasoning ?? defaults.aiReasoning,
  aiReasoningLevel: argv.aiReasoningLevel || defaults.aiReasoningLevel,
});
