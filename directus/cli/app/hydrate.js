import path from "node:path";
import { fileURLToPath } from "node:url";
import { queryCatalog } from "../lib/benefits-source.js";
import { writeCollectionFile } from "../lib/write-package.js";
import { runDpc } from "../lib/dpc.js";
import { collectionName as benefitCollection, toModelBenefit } from "../factories/model-benefit.js";
import { collectionName as planCollection, toModelPlan } from "../factories/model-plan.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const hydrate = async (input) => {
  const catalog = await queryCatalog(input.benefitsDatabaseUrl, {
    benefitCode: input.benefitCode,
    planCode: input.planCode,
    controlGroupCode: input.controlGroupCode,
  });

  const benefits = catalog.benefits.map(toModelBenefit);
  const benefitById = new Map(catalog.benefits.map((row) => [row.id, row]));
  const plans = catalog.plans.map((row) =>
    toModelPlan(row, {
      prefixPlanCodes: input.prefixPlanCodes,
      benefitCode: benefitById.get(row.benefit_id)?.code ?? input.benefitCode,
    })
  );

  const packagePath = path.resolve(ROOT, input.packagePath);
  const result = {
    benefitCode: input.benefitCode,
    planCode: input.planCode,
    packagePath,
    benefits,
    plans,
    wrote: false,
    imported: false,
  };

  if (input.dryRun) {
    return result;
  }

  await writeCollectionFile(packagePath, benefitCollection, benefits);
  await writeCollectionFile(packagePath, planCollection, plans);
  result.wrote = true;

  if (input.skipImport) {
    return result;
  }

  await runDpc({
    command: input.merge ? "merge" : "import",
    uri: input.directusUrl,
    user: input.directusUser,
    password: input.directusPassword,
    packagePath,
  });
  result.imported = true;
  return result;
};
