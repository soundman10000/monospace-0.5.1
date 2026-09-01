import { encryptSecret } from "./utils/index.js";

const API_KEY_ENV = "DIRECTUS_AI_XAI_API_KEY";
const COMPATIBLE_BASE_URL = "https://api.x.ai/v1";
const COMPATIBLE_NAME = "xAI";
const COMPATIBLE_MODELS = [
  { id: "grok-4.6", name: "Grok4.6", attachment: false, reasoning: false },
];
const OPENAI_ALLOWED_MODELS = ["gpt-5-nano", "gpt-5-mini", "gpt-5"];
const ANTHROPIC_ALLOWED_MODELS = ["claude-haiku-4-5", "claude-sonnet-4-5"];
const GOOGLE_ALLOWED_MODELS = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
];

export default {
  async up(knex) {
    const apiKey = process.env[API_KEY_ENV];
    if (!apiKey) {
      throw new Error(`${API_KEY_ENV} is not set`);
    }

    await knex("directus_settings").update({
      ai_openai_compatible_api_key: await encryptSecret(apiKey),
      ai_openai_compatible_base_url: COMPATIBLE_BASE_URL,
      ai_openai_compatible_name: COMPATIBLE_NAME,
      ai_openai_compatible_models: JSON.stringify(COMPATIBLE_MODELS),
      ai_openai_compatible_headers: null,
      ai_openai_allowed_models: JSON.stringify(OPENAI_ALLOWED_MODELS),
      ai_anthropic_allowed_models: JSON.stringify(ANTHROPIC_ALLOWED_MODELS),
      ai_google_allowed_models: JSON.stringify(GOOGLE_ALLOWED_MODELS),
    });
  },

  async down(knex) {
    await knex("directus_settings").update({
      ai_openai_compatible_api_key: null,
      ai_openai_compatible_base_url: null,
      ai_openai_compatible_name: null,
      ai_openai_compatible_models: null,
      ai_openai_compatible_headers: null,
      ai_openai_allowed_models: null,
      ai_anthropic_allowed_models: null,
      ai_google_allowed_models: null,
    });
  },
};
