import { unwrap } from "./helpers.js";

const settingsBody = ({ provider, apiKey, chatModel, fastModel, reasoning, reasoningLevel }) => ({
  connector: provider,
  connectorCredentials: { apiKey },
  chatModel: chatModel || null,
  fastModel: fastModel || null,
  chatReasoningEnabled: Boolean(reasoning),
  chatReasoningLevel: reasoning ? reasoningLevel || null : null,
});

export const getAiSettings = async (session, workspace) =>
  unwrap(await session.api(`/${workspace}/ai/settings`));

export const updateAiSettings = async (session, workspace, settings) => {
  await session.api(`/${workspace}/ai/settings`, {
    method: "PATCH",
    body: settingsBody(settings),
  });
};
