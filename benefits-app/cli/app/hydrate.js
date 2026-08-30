import knexFactory from "knex";
import knexConfig from "../../migrations/knexfile.js";
import { upsertBenefit } from "../factories/benefit.js";
import { removeBenefitDetails, upsertBenefitDetails } from "../factories/benefit-detail.js";
import { removeBenefitFeatures, upsertBenefitFeatures } from "../factories/benefit-feature.js";
import { upsertControlGroup } from "../factories/control-group.js";
import { loadFeatureTypes } from "../factories/feature-type.js";
import { DEFAULT_PLAN_CODES, listPlans, removePlans, upsertPlan } from "../factories/plan.js";
import { removePlanDetails, upsertPlanDetails } from "../factories/plan-detail.js";
import {
  listPlanDocumentIds,
  removePlanDocuments,
  upsertPlanDocuments,
} from "../factories/plan-document.js";
import {
  removePlanDocumentDetails,
  upsertPlanDocumentDetails,
} from "../factories/plan-document-detail.js";
import {
  planValueIndex,
  removePlanFeatureValuesByBenefitId,
  removePlanFeatureValuesByPlanId,
  upsertPlanFeatureValues,
} from "../factories/plan-feature-value.js";
import { removePlanImages, upsertPlanImages } from "../factories/plan-image.js";
import { mapSeries } from "../lib/async.js";
import { adjacentRanges } from "../lib/dates.js";

export const hydrate = async (input) => {
  const ranges = adjacentRanges(input.rangeCount);
  const startDate = new Date();
  const planCodes = input.planCode ? [input.planCode] : DEFAULT_PLAN_CODES;
  const context = { ...input, ranges, startDate, planCodes };

  if (input.dryRun) {
    return { ...context, wrote: false };
  }

  const knex = knexFactory(knexConfig);
  try {
    const summary = await knex.transaction((trx) => run(trx, context));
    return { ...context, ...summary, wrote: true };
  } finally {
    await knex.destroy();
  }
};

const run = async (trx, context) => {
  const featureTypes = await loadFeatureTypes(trx);
  const group = await upsertControlGroup(trx, context.controlGroupCode);
  const benefit = await upsertBenefit(trx, {
    group,
    code: context.benefitCode,
    startDate: context.startDate,
  });

  if (context.force) {
    await clearExisting(trx, benefit, context.planCode);
  }

  const details = await upsertBenefitDetails(trx, {
    group,
    benefit,
    ranges: context.ranges,
    startDate: context.startDate,
  });
  const features = await upsertBenefitFeatures(trx, { group, benefit, featureTypes });
  const plans = await hydratePlans(trx, {
    group,
    benefit,
    features,
    planCodes: context.planCodes,
    ranges: context.ranges,
    startDate: context.startDate,
  });

  return { group, benefit, details, features, plans };
};

const hydratePlans = (trx, { group, benefit, features, planCodes, ranges, startDate }) =>
  mapSeries(planCodes, (code, order) =>
    hydratePlan(trx, { group, benefit, features, code, order, ranges, startDate })
  );

const hydratePlan = async (trx, { group, benefit, features, code, order, ranges, startDate }) => {
  const plan = await upsertPlan(trx, { group, benefit, code, order, startDate });
  const details = await upsertPlanDetails(trx, { group, plan, ranges, startDate });
  const featureValues = await upsertPlanFeatureValues(trx, {
    group,
    plan,
    features,
    ranges,
    planIndex: planValueIndex(code, order),
  });
  const documents = await upsertPlanDocuments(trx, { group, plan });
  const documentDetails = await upsertPlanDocumentDetails(trx, {
    group,
    plan,
    documents,
    ranges,
  });
  const images = await upsertPlanImages(trx, { group, plan });
  return { plan, details, featureValues, documents, documentDetails, images };
};

const clearExisting = async (trx, benefit, planCode) => {
  const plans = await listPlans(trx, benefit.id, planCode);
  await mapSeries(plans, (plan) => clearPlanTree(trx, plan.id));
  await removePlans(
    trx,
    plans.map((plan) => plan.id)
  );

  if (planCode) {
    return;
  }

  await removeBenefitDetails(trx, benefit.id);
  await removePlanFeatureValuesByBenefitId(trx, benefit.id);
  await removeBenefitFeatures(trx, benefit.id);
};

const clearPlanTree = async (trx, planId) => {
  const documentIds = await listPlanDocumentIds(trx, planId);
  await removePlanDocumentDetails(trx, documentIds);
  await removePlanImages(trx, planId);
  await removePlanFeatureValuesByPlanId(trx, planId);
  await removePlanDocuments(trx, planId);
  await removePlanDetails(trx, planId);
};
