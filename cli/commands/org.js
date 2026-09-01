import { configureOrg } from "../app/org.js";
import { createClient } from "../client/index.js";
import { addBaseOptions, applyOptionSets, authFromArgv, withCommandErrorHandling } from "./common.js";

const COMMAND_NAME = "org";
const COMMAND_DESCRIPTION = "Set the organization name, brand color, and logo";

const builder = (cmd) =>
  applyOptionSets(cmd, addBaseOptions)
    .option("name", {
      type: "string",
      describe: "Organization name",
    })
    .option("color", {
      type: "string",
      describe: "Brand color as hex (for example #2663eb)",
    })
    .option("logo", {
      type: "string",
      describe: "Path to an organization logo image (uploaded as a system asset)",
    })
    .check((argv) => {
      if (!argv.name && !argv.color && !argv.logo) {
        throw new Error("Set --name, --color, or --logo");
      }
      return true;
    });

const printResult = (result) => {
  console.log(`url         ${result.url}`);
  console.log(`name        ${result.name}`);
  console.log(`color       ${result.color}`);
  console.log(`logo        ${result.logo || result.logoId || "none"}`);
};

const handler = withCommandErrorHandling(async (argv) => {
  const client = createClient(authFromArgv(argv));
  const settings = await configureOrg(client, {
    name: argv.name,
    color: argv.color,
    logo: argv.logo,
  });

  printResult({
    url: client.base,
    ...settings,
  });
});

export const registerOrgCommand = (yargs) =>
  yargs.command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);
