#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { registerAiCommand } from "./commands/ai.js";
import { registerIntrospectCommand } from "./commands/introspect.js";
import { registerOrgCommand } from "./commands/org.js";
import { registerSourceCommand } from "./commands/source.js";
import { registerWorkspaceCommand } from "./commands/workspace.js";

[
  registerWorkspaceCommand,
  registerSourceCommand,
  registerOrgCommand,
  registerIntrospectCommand,
  registerAiCommand,
]
  .reduce((cli, register) => register(cli), yargs(hideBin(process.argv)).scriptName("monospace-cli"))
  .strict()
  .demandCommand(1)
  .help()
  .parse();
