import { clip } from "../lib/text.js";

const CODE_MAX = 255;
const NAME_MAX = 255;
const COLLECTION = "model_plan";

export const toModelPlan = (row, { prefixPlanCodes, benefitCode }) => ({
  id: row.id,
  code: clip(prefixPlanCodes ? `${benefitCode}-${row.code}` : row.code, CODE_MAX),
  name: clip(row.name, NAME_MAX),
  description: row.description ?? null,
  sort: row.display_order ?? null,
  benefit: row.benefit_id,
});

export const collectionName = COLLECTION;
