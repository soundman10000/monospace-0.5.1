import { clip } from "../lib/text.js";
import { styleForPlan } from "../lib/style.js";

const CODE_MAX = 255;
const NAME_MAX = 255;
const COLLECTION = "model_plan";

export const toModelPlan = (row) => {
  const style = styleForPlan(row);
  return {
    id: row.id,
    code: clip(row.code, CODE_MAX),
    name: clip(row.name, NAME_MAX),
    description: row.description ?? null,
    sort: row.display_order ?? null,
    benefit: row.benefit_id,
    icon: style.icon,
    color: style.color,
  };
};

export const collectionName = COLLECTION;
