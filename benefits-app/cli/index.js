#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { registerHydrateCommand } from "./commands/hydrate.js";

registerHydrateCommand(yargs(hideBin(process.argv))).strict().help().parse();
