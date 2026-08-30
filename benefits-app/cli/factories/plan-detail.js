import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere } from "../lib/db.js";

const TABLE = "plan_detail";
const ENABLED = true;
const MODIFIED_BY_USER_ID = "hydrate-cli";

export const upsertPlanDetail = (trx, { group, plan, range, startDate }) =>
  findOrCreate(
    trx,
    TABLE,
    {
      plan_id: plan.id,
      from_date: range.from_date,
      to_date: range.to_date,
    },
    {
      plan_id: plan.id,
      control_group_id: group.id,
      enabled: ENABLED,
      from_date: range.from_date,
      to_date: range.to_date,
      start_date: startDate,
      modified_by_user_id: MODIFIED_BY_USER_ID,
    }
  );

export const upsertPlanDetails = (trx, { group, plan, ranges, startDate }) =>
  mapSeries(ranges, (range) => upsertPlanDetail(trx, { group, plan, range, startDate }));

export const removePlanDetails = (trx, planId) =>
  removeWhere(trx, TABLE, { plan_id: planId });
