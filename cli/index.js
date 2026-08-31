#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { registerSetupCommand } from "./commands/setup.js";
import { registerIntrospectCommand } from "./commands/introspect.js";
import { registerAiCommand } from "./commands/ai.js";

registerAiCommand(registerIntrospectCommand(registerSetupCommand(yargs(hideBin(process.argv)))))
  .strict()
  .demandCommand(1)
  .help()
  .parse();
