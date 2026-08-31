import { connect } from "../client/index.js";

const AI = {
  openai: {},
  anthropic: {},
};

const createAiSettingsBody = (provider, input) => ({
  connector: provider,
  connectorCredentials: { apiKey: input.aiApiKey },
  chatModel: input.aiChatModel || null,
  fastModel: input.aiFastModel || null,
  chatReasoningEnabled: Boolean(input.aiReasoning),
  chatReasoningLevel: input.aiReasoning ? input.aiReasoningLevel || null : null,
});

export const configureAi = async (client, input) => {
  if (!input.aiApiKey) return { skipped: true };
  
  const provider = String(input.aiProvider || "openai").toLowerCase();
  
  if (!(provider in AI)) {
    throw new Error(`AI provider must be ${Object.keys(AI).join(" or ")} (got ${input.aiProvider})`);
  }
  
  const body = createAiSettingsBody(provider, input);
  
  await client.api(`/${input.workspace}/ai/settings`, { method: "PATCH", body });
  
  return { skipped: false, provider, chatModel: body.chatModel, fastModel: body.fastModel };
};

export const configureWorkspaceAi = async (input) => {
  const client = await connect(input);
  const ai = await configureAi(client, input);
  
  if (ai.skipped) throw new Error("Set MONOSPACE_AI_API_KEY or --ai-api-key");
  
  return { url: client.base, workspace: input.workspace, ai };
};
