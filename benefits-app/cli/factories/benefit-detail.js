import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere } from "../lib/db.js";

const TABLE = "benefit_detail";
const ENABLED = true;
const MODIFIED_BY_USER_ID = "hydrate-cli";

export const upsertBenefitDetail = (trx, { group, benefit, range, startDate }) =>
  findOrCreate(
    trx,
    TABLE,
    {
      benefit_id: benefit.id,
      from_date: range.from_date,
      to_date: range.to_date,
    },
    {
      benefit_id: benefit.id,
      control_group_id: group.id,
      enabled: ENABLED,
      from_date: range.from_date,
      to_date: range.to_date,
      start_date: startDate,
      modified_by_user_id: MODIFIED_BY_USER_ID,
    }
  );

export const upsertBenefitDetails = (trx, { group, benefit, ranges, startDate }) =>
  mapSeries(ranges, (range) => upsertBenefitDetail(trx, { group, benefit, range, startDate }));

export const removeBenefitDetails = (trx, benefitId) =>
  removeWhere(trx, TABLE, { benefit_id: benefitId });
