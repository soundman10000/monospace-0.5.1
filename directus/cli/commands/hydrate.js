import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { hydrate } from "../app/hydrate.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(ROOT, "..", ".env") });
dotenv.config({ path: path.join(ROOT, ".env") });

const DEFAULT_CONTROL_GROUP_CODE = "DEMO";
const DEFAULT_BENEFITS_DATABASE_URL =
  process.env.BENEFITS_DATABASE_URL ||
  "postgres://postgres:monospace@localhost:5434/benefits";
const DEFAULT_DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DEFAULT_DIRECTUS_USER = process.env.DIRECTUS_USER || "admin@benefitsgo.tech";
const DEFAULT_DIRECTUS_PASSWORD = process.env.DIRECTUS_PASSWORD || "Empyrean1";
const DEFAULT_PACKAGE_PATH = process.env.DIRECTUS_PROVISIONS_PATH || "./provisions";
const DEFAULT_FORCE = false;
const DEFAULT_DRY_RUN = false;
const DEFAULT_SKIP_IMPORT = false;
const DEFAULT_MERGE = false;

const TARGET_SEPARATOR = "/";
const SCRIPT_NAME = "hydrate";
const COMMAND_NAME = "$0 [target]";
const COMMAND_DESCRIPTION =
  "Copy benefits/plans from the benefits catalog into Directus model_benefit / model_plan";
const TARGET_DESCRIPTION =
  "Optional benefit code, or Benefit/Plan (example: MEDICAL/GOLD). Omit to sync all benefits.";
const TARGET_ERROR = "target must be empty, BENEFIT, or BENEFIT/PLAN";

export const parseTarget = (target) => {
  if (target == null || String(target).trim() === "") {
    return { benefitCode: null, planCode: null };
  }
  const parts = String(target)
    .split(TARGET_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0 || parts.length > 2) {
    throw new Error(TARGET_ERROR);
  }
  return {
    benefitCode: parts[0].toUpperCase(),
    planCode: parts[1] ? parts[1].toUpperCase() : null,
  };
};

export const toHydrateInput = (argv) => {
  const { benefitCode, planCode } = parseTarget(argv.target);
  return {
    benefitCode,
    planCode,
    controlGroupCode: argv.controlGroup ? String(argv.controlGroup).toUpperCase() : DEFAULT_CONTROL_GROUP_CODE,
    benefitsDatabaseUrl: argv.benefitsDatabaseUrl || DEFAULT_BENEFITS_DATABASE_URL,
    directusUrl: argv.uri || DEFAULT_DIRECTUS_URL,
    directusUser: argv.user || DEFAULT_DIRECTUS_USER,
    directusPassword: argv.password || DEFAULT_DIRECTUS_PASSWORD,
    packagePath: argv.path || DEFAULT_PACKAGE_PATH,
    dryRun: argv.dryRun ?? DEFAULT_DRY_RUN,
    skipImport: argv.skipImport ?? DEFAULT_SKIP_IMPORT,
    merge: argv.merge ?? DEFAULT_MERGE,
  };
};

const builder = (cmd) =>
  cmd
    .positional("target", {
      type: "string",
      describe: TARGET_DESCRIPTION,
      default: null,
    })
    .option("control-group", {
      alias: "g",
      type: "string",
      default: DEFAULT_CONTROL_GROUP_CODE,
      describe: "Benefits control group code",
    })
    .option("benefits-database-url", {
      type: "string",
      default: DEFAULT_BENEFITS_DATABASE_URL,
      describe: "Postgres URL for the benefits catalog",
    })
    .option("uri", {
      type: "string",
      default: DEFAULT_DIRECTUS_URL,
      describe: "Directus base URL",
    })
    .option("user", {
      type: "string",
      default: DEFAULT_DIRECTUS_USER,
      describe: "Directus login email",
    })
    .option("password", {
      type: "string",
      default: DEFAULT_DIRECTUS_PASSWORD,
      describe: "Directus login password",
    })
    .option("path", {
      alias: "f",
      type: "string",
      default: DEFAULT_PACKAGE_PATH,
      describe: "Folder for model_benefit.json / model_plan.json",
    })
    .option("merge", {
      type: "boolean",
      default: DEFAULT_MERGE,
      describe: "Use dpc merge (deletes Directus items not in the package) instead of import",
    })
    .option("skip-import", {
      type: "boolean",
      default: DEFAULT_SKIP_IMPORT,
      describe: "Write JSON only; do not call dpc",
    })
    .option("dry-run", {
      type: "boolean",
      default: DEFAULT_DRY_RUN,
      describe: "Print the mapped items without writing",
    });

const handler = async (argv) => {
  try {
    const input = toHydrateInput(argv);
    const result = await hydrate(input);
    printResult(result, input);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
};

export const registerHydrateCommand = (yargs) =>
  yargs.scriptName(SCRIPT_NAME).usage("$0 [target]").command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);

const printResult = (result, input) => {
  console.log(`benefits        ${input.benefitsDatabaseUrl}`);
  console.log(`directus        ${input.directusUrl}`);
  console.log(`package         ${result.packagePath}`);
  console.log(`scope           ${input.benefitCode ?? "*"}${input.planCode ? `/${input.planCode}` : ""}`);
  console.log(`model_benefit   ${result.benefits.length}`);
  console.log(`model_plan      ${result.plans.length}`);
  console.log(`page_plan_info  ${result.coverage?.pages.length ?? 0}`);
  console.log(`block_title     ${result.coverage?.titles.length ?? 0}`);
  console.log(`block_markdown  ${result.coverage?.markdowns.length ?? 0}`);
  console.log(`block_document  ${result.coverage?.documents.length ?? 0}`);
  console.log(`cards           ${result.coverage?.cards.length ?? 0}`);
  console.log(`doc containers  ${result.coverage?.documentContainers.length ?? 0}`);
  console.log(`layouts         ${result.coverage?.layouts.length ?? 0}`);
  result.benefits.forEach((item) => {
    console.log(`  benefit ${item.code}  ${item.id}`);
  });
  result.plans.forEach((item) => {
    console.log(`  plan    ${item.code}  ${item.id}  benefit=${item.benefit}`);
  });
  if (!result.wrote) {
    console.log("dry-run         no files written");
    return;
  }
  console.log(
    "wrote           model_benefit, model_plan, page_plan_info, cards, documents, blocks, layouts"
  );
  if (result.imported) {
    console.log(`dpc             ${input.merge ? "merge" : "import"}`);
  } else {
    console.log("dpc             skipped");
  }
};
