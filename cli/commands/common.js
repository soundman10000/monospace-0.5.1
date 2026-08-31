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
    default: defaults.workspace,
    describe: "Workspace API name",
  },
  "workspace-name": {
    type: "string",
    default: defaults.workspaceName,
    describe: "Workspace display name",
  },
  source: {
    type: "string",
    default: defaults.source,
    describe: "Data source API name",
  },
  host: {
    type: "string",
    default: defaults.host,
    describe: "Benefits Postgres host as seen by Monospace",
  },
  port: {
    type: "number",
    default: defaults.port,
    describe: "Benefits Postgres port as seen by Monospace",
  },
  user: {
    type: "string",
    default: defaults.user,
    describe: "Benefits Postgres user",
  },
  "db-password": {
    type: "string",
    default: defaults.dbPassword,
    describe: "Benefits Postgres password",
  },
  dbname: {
    type: "string",
    default: defaults.dbname,
    describe: "Benefits Postgres database",
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

export const addBenefitsDatabaseOptions = (cmd) =>
  addOptions(cmd, ["host", "port", "user", "db-password", "dbname"]);

export const withCommandErrorHandling = (run) => async (argv) => {
  try {
    await run(argv);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
};