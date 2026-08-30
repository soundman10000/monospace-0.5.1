import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere } from "../lib/db.js";
import { clip } from "../lib/text.js";
import {
  FEATURE_TYPE_BOOLEAN,
  FEATURE_TYPE_DATE,
  FEATURE_TYPE_INTEGER,
  FEATURE_TYPE_NUMERIC,
  FEATURE_TYPE_STRING,
} from "./feature-type.js";

const TABLE = "benefit_feature";
const CODE_MAX = 30;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 255;
const IS_VISIBLE = true;

const FEATURE_IN_NETWORK = {
  code: "IN_NETWORK",
  type: FEATURE_TYPE_BOOLEAN,
  name: "In Network",
  description: "Whether the plan is in-network",
  values: [true, true, true],
};

const FEATURE_WAITING_DAYS = {
  code: "WAITING_DAYS",
  type: FEATURE_TYPE_INTEGER,
  name: "Waiting Period Days",
  description: "Days before coverage begins",
  values: [90, 30, 0],
};

const FEATURE_DEDUCTIBLE = {
  code: "DEDUCTIBLE",
  type: FEATURE_TYPE_NUMERIC,
  name: "Annual Deductible",
  description: "Annual deductible amount",
  values: [2500.0, 1000.0, 250.0],
};

const FEATURE_TIER = {
  code: "TIER",
  type: FEATURE_TYPE_STRING,
  name: "Coverage Tier",
  description: "Employee coverage tier",
  values: ["Employee", "Employee+Spouse", "Family"],
};

const FEATURE_RENEWAL = {
  code: "RENEWAL",
  type: FEATURE_TYPE_DATE,
  name: "Renewal Date",
  description: "Next renewal timestamp",
  values: ["2026-01-01T00:00:00Z", "2026-07-01T00:00:00Z", "2027-01-01T00:00:00Z"],
};

export const FEATURES = [
  FEATURE_IN_NETWORK,
  FEATURE_WAITING_DAYS,
  FEATURE_DEDUCTIBLE,
  FEATURE_TIER,
  FEATURE_RENEWAL,
];

export const upsertBenefitFeature = async (trx, { group, benefit, featureTypes, definition, order }) => {
  const record = await findOrCreate(
    trx,
    TABLE,
    { benefit_id: benefit.id, code: definition.code },
    {
      benefit_id: benefit.id,
      control_group_id: group.id,
      feature_type_id: featureTypes.get(definition.type).id,
      code: clip(definition.code, CODE_MAX),
      external_code: clip(definition.code, CODE_MAX),
      name: clip(definition.name, NAME_MAX),
      description: clip(definition.description, DESCRIPTION_MAX),
      display_order: order,
      is_visible: IS_VISIBLE,
    }
  );
  return { record, definition };
};

export const upsertBenefitFeatures = (trx, { group, benefit, featureTypes }) =>
  mapSeries(FEATURES, (definition, order) =>
    upsertBenefitFeature(trx, { group, benefit, featureTypes, definition, order })
  );

export const removeBenefitFeatures = (trx, benefitId) =>
  removeWhere(trx, TABLE, { benefit_id: benefitId });
