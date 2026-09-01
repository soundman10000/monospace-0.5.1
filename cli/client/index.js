import { getAiSettings, updateAiSettings } from "./ai.js";
import { uploadSystemAsset } from "./assets.js";
import { resolveApiKey } from "./auth.js";
import { trimSlash, unwrap } from "./helpers.js";
import { createSession, waitForApi } from "./session.js";
import { getOrgSettings, updateOrgSettings } from "./settings.js";
import { createCollectionMeta, listCollections, updateCollectionMeta } from "./collections.js";
import { createSource, introspectSource, listSources } from "./sources.js";
import { createWorkspace, listWorkspaces, updateWorkspace } from "./workspaces.js";

const readCurrentUser = async (session) =>
  unwrap(await session.api("/system/users/me", { query: { fields: "id,email,fullName" } }));

export const createClient = (input) => {
  const state = {
    base: trimSlash(input.url),
    user: null,
    auth: { minted: false, named: false, token: null },
  };
  let sessionPromise;

  const session = () => {
    sessionPromise ??= (async () => {
      try {
        await waitForApi(input.url);
        const resolved = await resolveApiKey(input.url, input);
        const created = createSession(input.url, resolved.token);
        state.user = await readCurrentUser(created);
        state.auth = {
          minted: Boolean(resolved.minted),
          named: Boolean(resolved.named),
          token: resolved.minted ? resolved.token : null,
        };
        return created;
      } catch (error) {
        sessionPromise = undefined;
        throw error;
      }
    })();
    return sessionPromise;
  };

  const withSession = (fn) => async (...args) => fn(await session(), ...args);

  return {
    get base() {
      return state.base;
    },
    get user() {
      return state.user;
    },
    get auth() {
      return state.auth;
    },
    listWorkspaces: withSession(listWorkspaces),
    createWorkspace: withSession(createWorkspace),
    updateWorkspace: withSession(updateWorkspace),
    listSources: withSession(listSources),
    createSource: withSession(createSource),
    introspectSource: withSession(introspectSource),
    listCollections: withSession(listCollections),
    createCollectionMeta: withSession(createCollectionMeta),
    updateCollectionMeta: withSession(updateCollectionMeta),
    getAiSettings: withSession(getAiSettings),
    updateAiSettings: withSession(updateAiSettings),
    getOrgSettings: withSession(getOrgSettings),
    updateOrgSettings: withSession(updateOrgSettings),
    uploadSystemAsset: withSession(uploadSystemAsset),
  };
};
