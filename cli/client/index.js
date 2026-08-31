import { resolveApiKey } from "./auth.js";
import { unwrap } from "./helpers.js";
import { createSession, waitForApi } from "./session.js";

export { asList, unwrap } from "./helpers.js";

export const connect = async (input) => {
  await waitForApi(input.url);
  const apiKey = await resolveApiKey(input.url, input);
  const session = createSession(input.url, apiKey);
  const user = unwrap(await session.api("/system/users/me", { query: { fields: "id,email,fullName" } }));
  
  return { ...session, user };
};
