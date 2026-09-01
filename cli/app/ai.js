import { createClient } from "../client/index.js";

const AI = {
  openai: {},
  anthropic: {},
};

export const configureAi = async (client, input) => {
  if (!input.aiApiKey) return { skipped: true };

  const provider = String(input.aiProvider || "openai").toLowerCase();

  if (!(provider in AI)) {
    throw new Error(`AI provider must be ${Object.keys(AI).join(" or ")} (got ${input.aiProvider})`);
  }

  await client.updateAiSettings(input.workspace, {
    provider,
    apiKey: input.aiApiKey,
    chatModel: input.aiChatModel,
    fastModel: input.aiFastModel,
    reasoning: input.aiReasoning,
    reasoningLevel: input.aiReasoningLevel,
  });

  return {
    skipped: false,
    provider,
    chatModel: input.aiChatModel || null,
    fastModel: input.aiFastModel || null,
  };
};

export const configureWorkspaceAi = async (input) => {
  const client = createClient(input);
  const ai = await configureAi(client, input);

  if (ai.skipped) throw new Error("Set MONOSPACE_AI_API_KEY or --ai-api-key");

  return { url: client.base, workspace: input.workspace, ai };
};
