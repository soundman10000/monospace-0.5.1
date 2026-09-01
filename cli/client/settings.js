import { unwrap } from "./helpers.js";

export const getOrgSettings = async (session) => unwrap(await session.api("/system/settings"));

export const updateOrgSettings = async (session, settings) =>
  unwrap(
    await session.api("/system/settings", {
      method: "PATCH",
      body: settings,
    }),
  );
