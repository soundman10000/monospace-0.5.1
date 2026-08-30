import process from "node:process";
import { hydrate } from "../app/hydrate.js";
import { RANGE_END, RANGE_START } from "../lib/dates.js";

const DEFAULT_CONTROL_GROUP_CODE = "DEMO";
const DEFAULT_RANGE_COUNT = 2;
const DEFAULT_FORCE = false;
const DEFAULT_DRY_RUN = false;

const TARGET_SEPARATOR = "/";
const SCRIPT_NAME = "hydrate";
const COMMAND_NAME = "$0 <target>";
const COMMAND_DESCRIPTION = "Hydrate a benefit or benefit/plan with valid child rows";
const TARGET_DESCRIPTION = "Benefit code, or Benefit/Plan (example: MEDICAL/GOLD)";
const CONTROL_GROUP_DESCRIPTION = "Control group code";
const RANGES_DESCRIPTION = `Adjacent from/to ranges (first from=${RANGE_START}, last to=${RANGE_END})`;
const FORCE_DESCRIPTION = "Replace existing child rows for the target";
const DRY_RUN_DESCRIPTION = "Print the graph without writing";
const TARGET_ERROR = "target must be BENEFIT or BENEFIT/PLAN";

export const parseTarget = (target) => {
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
    controlGroupCode: String(argv.controlGroup ?? DEFAULT_CONTROL_GROUP_CODE).toUpperCase(),
    rangeCount: argv.ranges ?? DEFAULT_RANGE_COUNT,
    force: argv.force ?? DEFAULT_FORCE,
    dryRun: argv.dryRun ?? DEFAULT_DRY_RUN,
  };
};

const builder = (cmd) =>
  cmd
    .positional("target", {
      type: "string",
      describe: TARGET_DESCRIPTION,
    })
    .option("control-group", {
      alias: "g",
      type: "string",
      default: DEFAULT_CONTROL_GROUP_CODE,
      describe: CONTROL_GROUP_DESCRIPTION,
    })
    .option("ranges", {
      alias: "n",
      type: "number",
      default: DEFAULT_RANGE_COUNT,
      describe: RANGES_DESCRIPTION,
    })
    .option("force", {
      alias: "f",
      type: "boolean",
      default: DEFAULT_FORCE,
      describe: FORCE_DESCRIPTION,
    })
    .option("dry-run", {
      type: "boolean",
      default: DEFAULT_DRY_RUN,
      describe: DRY_RUN_DESCRIPTION,
    });

const handler = async (argv) => {
  try {
    const input = toHydrateInput(argv);
    const result = await hydrate(input);
    printResult(result);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
};

export const registerHydrateCommand = (yargs) =>
  yargs.scriptName(SCRIPT_NAME).usage("$0 <target>").command(COMMAND_NAME, COMMAND_DESCRIPTION, builder, handler);

const printResult = (result) => {
  if (!result.wrote) {
    console.log(`control_group: ${result.controlGroupCode}`);
    console.log(`benefit:       ${result.benefitCode}`);
    console.log(`plan:          ${result.planCodes.join(", ")}`);
    console.log(`start_date:    now`);
    console.log("ranges:");
    result.ranges.forEach((range) => {
      console.log(`  ${range.from_date} -> ${range.to_date}`);
    });
    return;
  }

  console.log(`control_group  ${result.group.code}  ${result.group.id}`);
  console.log(`benefit        ${result.benefit.code}  ${result.benefit.id}`);
  console.log(`start_date     ${result.startDate.toISOString()}`);
  console.log(
    `ranges         ${result.ranges.map((range) => `${range.from_date}->${range.to_date}`).join(" | ")}`
  );
  console.log(`benefit_detail ${result.details.length}`);
  console.log(`features       ${result.features.length}`);
  result.plans.forEach((item) => {
    console.log(
      `plan           ${item.plan.code}  details=${item.details.length} values=${item.featureValues.length} docs=${item.documents.length} images=${item.images.length}`
    );
  });
};
