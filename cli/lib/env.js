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
  aiProvider: process.env.MONOSPACE_AI_PROVIDER || "openai",
  aiApiKey: process.env.MONOSPACE_AI_API_KEY || "",
  aiChatModel: process.env.MONOSPACE_AI_CHAT_MODEL || openaiModels.chatModel,
  aiFastModel: process.env.MONOSPACE_AI_FAST_MODEL || openaiModels.fastModel,
  aiReasoning: process.env.MONOSPACE_AI_REASONING === "false" ? false : openaiModels.chatReasoningEnabled,
  aiReasoningLevel: process.env.MONOSPACE_AI_REASONING_LEVEL || openaiModels.chatReasoningLevel,
};
