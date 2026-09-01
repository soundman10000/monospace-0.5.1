const AI = {
  openai: {},
  anthropic: {},
};

export const configureAi = async (client, workspace, settings) => {
  if (!settings.apiKey) return { skipped: true };

  const provider = String(settings.provider || "openai").toLowerCase();

  if (!(provider in AI)) {
    throw new Error(`AI provider must be ${Object.keys(AI).join(" or ")} (got ${settings.provider})`);
  }

  await client.updateAiSettings(workspace, {
    provider,
    apiKey: settings.apiKey,
    chatModel: settings.chatModel,
    fastModel: settings.fastModel,
    reasoning: settings.reasoning,
    reasoningLevel: settings.reasoningLevel,
  });

  return {
    skipped: false,
    provider,
    chatModel: settings.chatModel || null,
    fastModel: settings.fastModel || null,
  };
};
