import process from "node:process";
import { defaults } from "../lib/env.js";

const OPTION_DEFINITIONS = {
  url: {
    type: "string",
    default: defaults.url,
    describe: "Monospace base URL",
  },
  "api-key": {
    type: "string",
    default: defaults.apiKey,
    describe: "Monospace API key (skips login when set)",
  },
  email: {
    type: "string",
    default: defaults.email,
    describe: "Admin email",
  },
  password: {
    type: "string",
    default: defaults.password,
    describe: "Admin password",
  },
  "full-name": {
    type: "string",
    default: defaults.fullName,
    describe: "Admin display name",
  },
  workspace: {
    type: "string",
    demandOption: true,
    describe: "Workspace API name",
  },
  "workspace-name": {
    type: "string",
    describe: "Workspace display name (defaults to --workspace)",
  },
  source: {
    type: "string",
    demandOption: true,
    describe: "Data source API name",
  },
  host: {
    type: "string",
    demandOption: true,
    describe: "Postgres host as seen by Monospace",
  },
  port: {
    type: "number",
    demandOption: true,
    describe: "Postgres port as seen by Monospace",
  },
  user: {
    type: "string",
    demandOption: true,
    describe: "Postgres user",
  },
  "db-password": {
    type: "string",
    demandOption: true,
    describe: "Postgres password",
  },
  dbname: {
    type: "string",
    demandOption: true,
    describe: "Postgres database",
  },
};

const definedOption = (name) => {
  const option = OPTION_DEFINITIONS[name];
  if (!option) {
    throw new Error(`Unknown command option: ${name}`);
  }
  return option;
};

const addOptions = (cmd, names) =>
  names.reduce((next, name) => next.option(name, definedOption(name)), cmd);

export const applyOptionSets = (cmd, ...optionSets) =>
  optionSets.reduce((next, optionSet) => optionSet(next), cmd);

export const addBaseOptions = (cmd) => addOptions(cmd, ["url", "api-key", "email", "password"]);

export const addFullNameOption = (cmd) => addOptions(cmd, ["full-name"]);

export const addWorkspaceOption = (cmd) => addOptions(cmd, ["workspace"]);

export const addWorkspaceNameOption = (cmd) => addOptions(cmd, ["workspace-name"]);

export const addSourceOption = (cmd) => addOptions(cmd, ["source"]);

export const addSourceDatabaseOptions = (cmd) =>
  addOptions(cmd, ["host", "port", "user", "db-password", "dbname"]);

export const printAi = (ai) => {
  if (ai?.skipped) {
    console.log("ai          skipped (no MONOSPACE_AI_API_KEY; shared across workspaces)");
    return;
  }
  if (ai) {
    console.log(`ai          ${ai.provider}  chat=${ai.chatModel}  fast=${ai.fastModel}`);
  }
};

export const printAuth = (client) => {
  if (client.auth?.minted && client.auth.token) {
    console.log(`api-key     ${client.auth.token}  created  org-level (not per workspace); save as MONOSPACE_API_KEY`);
    return;
  }
  if (client.auth?.named) {
    console.log("api-key     org-level, user-scoped (same key for every workspace)");
  }
};

export const withCommandErrorHandling = (run) => async (argv) => {
  try {
    await run(argv);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
};