import { updateAiSettings } from "./ai.js";
import { resolveApiKey } from "./auth.js";
import { trimSlash, unwrap } from "./helpers.js";
import { createSession, waitForApi } from "./session.js";
import { createSource, introspectSource, listSources } from "./sources.js";
import { createWorkspace, listWorkspaces } from "./workspaces.js";

const readCurrentUser = async (session) =>
  unwrap(await session.api("/system/users/me", { query: { fields: "id,email,fullName" } }));

export const createClient = (input) => {
  const state = {
    base: trimSlash(input.url),
    user: null,
  };
  let sessionPromise;

  const session = () => {
    sessionPromise ??= (async () => {
      try {
        await waitForApi(input.url);
        const apiKey = await resolveApiKey(input.url, input);
        const created = createSession(input.url, apiKey);
        state.user = await readCurrentUser(created);
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
    listWorkspaces: withSession(listWorkspaces),
    createWorkspace: withSession(createWorkspace),
    listSources: withSession(listSources),
    createSource: withSession(createSource),
    introspectSource: withSession(introspectSource),
    updateAiSettings: withSession(updateAiSettings),
  };
};
