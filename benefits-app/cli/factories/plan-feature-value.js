import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere, table } from "../lib/db.js";
import { clip } from "../lib/text.js";
import {
  FEATURE_TYPE_BOOLEAN,
  FEATURE_TYPE_DATE,
  FEATURE_TYPE_INTEGER,
  FEATURE_TYPE_NUMERIC,
} from "./feature-type.js";

const TABLE = "plan_feature_value";
const BENEFIT_FEATURE_TABLE = "benefit_feature";
const DISPLAY_VALUE_MAX = 1000;
const STRING_VALUE_MAX = 255;
const LINK_VALUE = null;

const TIER_INDEX_BASIC = 0;
const TIER_INDEX_STANDARD = 1;
const TIER_INDEX_PREMIUM = 2;
const BASIC_TIER_CODES = ["BASIC", "BRONZE", "LOW"];
const STANDARD_TIER_CODES = ["STANDARD", "SILVER", "MID"];
const PREMIUM_TIER_CODES = ["PREMIUM", "GOLD", "PLATINUM", "PLUS", "HIGH"];

const EMPTY_TYPED_VALUE = {
  boolean_value: null,
  string_value: null,
  date_value: null,
  integer_value: null,
  number_value: null,
};

const typedValue = (type, raw) => {
  if (type === FEATURE_TYPE_BOOLEAN) {
    return { ...EMPTY_TYPED_VALUE, boolean_value: Boolean(raw) };
  }
  if (type === FEATURE_TYPE_INTEGER) {
    return { ...EMPTY_TYPED_VALUE, integer_value: Number(raw) };
  }
  if (type === FEATURE_TYPE_NUMERIC) {
    return { ...EMPTY_TYPED_VALUE, number_value: Number(raw) };
  }
  if (type === FEATURE_TYPE_DATE) {
    return { ...EMPTY_TYPED_VALUE, date_value: new Date(raw) };
  }
  return { ...EMPTY_TYPED_VALUE, string_value: clip(String(raw), STRING_VALUE_MAX) };
};

export const planValueIndex = (code, fallbackIndex) => {
  const key = String(code).toUpperCase();
  if (BASIC_TIER_CODES.includes(key)) {
    return TIER_INDEX_BASIC;
  }
  if (STANDARD_TIER_CODES.includes(key)) {
    return TIER_INDEX_STANDARD;
  }
  if (PREMIUM_TIER_CODES.includes(key)) {
    return TIER_INDEX_PREMIUM;
  }
  return fallbackIndex;
};

const featureValueAt = (definition, planIndex) => {
  const lastIndex = definition.values.length - 1;
  const index = Math.min(planIndex, lastIndex);
  return definition.values[index];
};

export const upsertPlanFeatureValue = (trx, { group, plan, feature, range, raw, typed }) =>
  findOrCreate(
    trx,
    TABLE,
    {
      benefit_feature_id: feature.record.id,
      plan_id: plan.id,
      from_date: range.from_date,
      to_date: range.to_date,
    },
    {
      plan_id: plan.id,
      benefit_feature_id: feature.record.id,
      control_group_id: group.id,
      boolean_value: typed.boolean_value,
      string_value: typed.string_value,
      date_value: typed.date_value,
      integer_value: typed.integer_value,
      number_value: typed.number_value,
      link_value: LINK_VALUE,
      display_value: clip(String(raw), DISPLAY_VALUE_MAX),
      from_date: range.from_date,
      to_date: range.to_date,
    }
  );

export const upsertPlanFeatureValues = (trx, { group, plan, features, ranges, planIndex }) =>
  mapSeries(features, (feature) => {
    const raw = featureValueAt(feature.definition, planIndex);
    const typed = typedValue(feature.definition.type, raw);
    return mapSeries(ranges, (range) =>
      upsertPlanFeatureValue(trx, { group, plan, feature, range, raw, typed })
    );
  }).then((groups) => groups.flat());

export const removePlanFeatureValuesByPlanId = (trx, planId) =>
  removeWhere(trx, TABLE, { plan_id: planId });

export const removePlanFeatureValuesByBenefitId = (trx, benefitId) =>
  trx(table(TABLE))
    .whereIn(
      "benefit_feature_id",
      trx(table(BENEFIT_FEATURE_TABLE)).select("id").where({ benefit_id: benefitId })
    )
    .del();
