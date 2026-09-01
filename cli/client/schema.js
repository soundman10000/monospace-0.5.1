import { unwrap } from "./helpers.js";

export const migrateSchema = async (session, workspace, operations) =>
  unwrap(
    await session.api(`/${workspace}/schema/migrate`, {
      method: "POST",
      body: { operations },
    }),
  );
