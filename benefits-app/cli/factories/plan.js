import { findOrCreate, removeWhereIn, table } from "../lib/db.js";
import { clip, titleize } from "../lib/text.js";

const TABLE = "plan";
const CODE_MAX = 4000;
const NAME_MAX = 4000;
const DESCRIPTION_MAX = 255;
const DESCRIPTION_PREFIX = "plan for";
const MODIFIED_BY_USER_ID = "hydrate-cli";

export const DEFAULT_PLAN_CODES = ["BASIC", "STANDARD", "PREMIUM"];

export const upsertPlan = (trx, { group, benefit, code, order, startDate }) => {
  const clippedCode = clip(code, CODE_MAX);
  return findOrCreate(
    trx,
    TABLE,
    { benefit_id: benefit.id, code: clippedCode },
    {
      benefit_id: benefit.id,
      control_group_id: group.id,
      code: clippedCode,
      name: clip(`${titleize(benefit.code)} ${titleize(code)}`, NAME_MAX),
      description: clip(`${titleize(code)} ${DESCRIPTION_PREFIX} ${titleize(benefit.code)}`, DESCRIPTION_MAX),
      display_order: order,
      start_date: startDate,
      modified_by_user_id: MODIFIED_BY_USER_ID,
    }
  );
};

export const listPlans = (trx, benefitId, planCode) => {
  const query = trx(table(TABLE)).where({ benefit_id: benefitId });
  return planCode ? query.andWhere({ code: planCode }).select("id", "code") : query.select("id", "code");
};

export const removePlans = (trx, planIds) => removeWhereIn(trx, TABLE, "id", planIds);
