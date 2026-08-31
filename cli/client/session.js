import { createClient } from "@monospace/sdk";
import { ofetch } from "ofetch";
import { throwMapped } from "./errors.js";
import { sleep, trimSlash } from "./helpers.js";

const READY_PATH = "/api/system/info";
const POLL_MS = 2000;
const READY_TIMEOUT_MS = 180_000;

export const waitForApi = async (url, { timeoutMs = READY_TIMEOUT_MS } = {}) => {
  const base = trimSlash(url);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await ofetch(`${base}${READY_PATH}`, { headers: { Accept: "application/json" } });
      return;
    } catch {
      await sleep(POLL_MS);
    }
  }
  throw new Error(`Monospace did not become ready at ${base}`);
};

const bearerApi = (base, apiKey) =>
  ofetch.create({
    baseURL: `${base}/api`,
    retry: 0,
    headers: { Authorization: `Bearer ${apiKey}` },
    onResponseError({ response }) {
      throwMapped(response);
    },
  });

export const createSession = (url, apiKey) => {
  const base = trimSlash(url);
  const api = bearerApi(base, apiKey);
  return {
    base,
    apiKey,
    api,
    workspaceClient: (workspace) =>
      createClient({
        url: base,
        project: workspace,
        apiKey,
        unwrapEnvelope: true,
        strictNull: false,
      }),
  };
};
