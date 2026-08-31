import { ofetch } from "ofetch";
import { throwMapped } from "./errors.js";
import { trimSlash, unwrap } from "./helpers.js";

const CLI_KEY_NAME = "cli";
const IGNORE_BOOTSTRAP = new Set([400, 403, 409]);

const publicApi = (url) =>
  ofetch.create({
    baseURL: `${trimSlash(url)}/api`,
    retry: 0,
    onResponseError({ response }) {
      throwMapped(response);
    },
  });

const tokenFrom = (body) => unwrap(body)?.accessToken || unwrap(body)?.access_token || null;

const keyFrom = (body) => {
  const data = unwrap(body);
  if (typeof data === "string") return data;
  return data?.key || data?.token || data?.accessToken || null;
};

const createBootstrapBody = (input) => ({
  email: input.email,
  password: input.password,
  fullName: input.fullName,
  acceptTerms: true,
  acceptMarketing: false,
});

const bootstrapAdmin = async (url, input) => {
  try {
    await publicApi(url)("/system/bootstrap", {
      method: "POST",
      body: createBootstrapBody(input),
    });
  } catch (error) {
    if (!IGNORE_BOOTSTRAP.has(error.status)) throw error;
  }
};

const loginJson = async (url, { email, password }) => {
  const body = await publicApi(url)("/auth/providers/local/password/login", {
    method: "POST",
    body: { email, password, mode: "json" },
  });
  
  const accessToken = tokenFrom(body);

  if (!accessToken) throw new Error("Login did not return an access token");
  
  return accessToken;
};

const authedApi = (url, accessToken) =>
  ofetch.create({
    baseURL: `${trimSlash(url)}/api`,
    retry: 0,
    headers: { Authorization: `Bearer ${accessToken}` },
    onResponseError({ response }) {
      throwMapped(response);
    },
  });

const mintApiKey = async (url, accessToken) => {
  const api = authedApi(url, accessToken);
  const me = unwrap(await api("/system/users/me", { query: { fields: "id,email" } }));
  try {
    const created = unwrap(
      await api("/system/api-keys", {
        method: "POST",
        body: {
          name: CLI_KEY_NAME,
          description: "monospace-cli",
          ttl: "365days",
          userId: me.id,
        },
      }),
    );
    return keyFrom(created);
  } catch {
    return null;
  }
};

export const resolveApiKey = async (url, input) => {
  if (input.apiKey) return input.apiKey;
  
  await bootstrapAdmin(url, input);
  
  const accessToken = await loginJson(url, input);
  
  return (await mintApiKey(url, accessToken)) || accessToken;
};
