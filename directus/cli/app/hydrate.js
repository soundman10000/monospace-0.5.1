import path from "node:path";
import { fileURLToPath } from "node:url";
import { queryCatalog } from "../lib/benefits-source.js";
import { writeCollectionFile } from "../lib/write-package.js";
import { runDpc } from "../lib/dpc.js";
import { collectionName as benefitCollection, toModelBenefit } from "../factories/model-benefit.js";
import { collectionName as planCollection, toModelPlan } from "../factories/model-plan.js";
import { buildCoveragePages } from "../factories/coverage-pages.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const hydrate = async (input) => {
  const catalog = await queryCatalog(input.benefitsDatabaseUrl, {
    benefitCode: input.benefitCode,
    planCode: input.planCode,
    controlGroupCode: input.controlGroupCode,
  });

  const benefits = catalog.benefits.map(toModelBenefit);
  const plans = catalog.plans.map(toModelPlan);
  const coverage = buildCoveragePages(plans, catalog.benefits);

  const packagePath = path.resolve(ROOT, input.packagePath);
  const result = {
    benefitCode: input.benefitCode,
    planCode: input.planCode,
    packagePath,
    benefits,
    plans,
    coverage,
    wrote: false,
    imported: false,
  };

  if (input.dryRun) {
    return result;
  }

  await writeCollectionFile(packagePath, benefitCollection, benefits);
  await writeCollectionFile(packagePath, planCollection, plans);
  await writeCollectionFile(packagePath, "block_title", coverage.titles);
  await writeCollectionFile(packagePath, "block_markdown", coverage.markdowns);
  await writeCollectionFile(packagePath, "block_document", coverage.documents);
  await writeCollectionFile(packagePath, "layout_card_container", coverage.cards);
  await writeCollectionFile(packagePath, "layout_card_container_blocks", coverage.cardBlocks);
  await writeCollectionFile(packagePath, "layout_documents_container", coverage.documentContainers);
  await writeCollectionFile(
    packagePath,
    "layout_documents_container_documents",
    coverage.documentLinks
  );
  await writeCollectionFile(packagePath, "layout_grid_container", coverage.layouts);
  await writeCollectionFile(packagePath, "layout_grid_container_blocks", coverage.layoutBlocks);
  await writeCollectionFile(packagePath, "page_plan_info", coverage.pages);
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
