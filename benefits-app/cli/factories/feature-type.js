import { table } from "../lib/db.js";

const TABLE = "feature_type";
const MISSING_SUFFIX = "is missing; run migrations first";

export const FEATURE_TYPE_BOOLEAN = "BOOLEAN";
export const FEATURE_TYPE_INTEGER = "INTEGER";
export const FEATURE_TYPE_NUMERIC = "NUMERIC";
export const FEATURE_TYPE_STRING = "STRING";
export const FEATURE_TYPE_DATE = "DATE";

export const FEATURE_TYPE_CODES = [
  FEATURE_TYPE_BOOLEAN,
  FEATURE_TYPE_INTEGER,
  FEATURE_TYPE_NUMERIC,
  FEATURE_TYPE_STRING,
  FEATURE_TYPE_DATE,
];

export const loadFeatureTypes = async (trx) => {
  const rows = await trx(table(TABLE)).select("id", "code");
  const byCode = new Map(rows.map((row) => [row.code, row]));
  const missing = FEATURE_TYPE_CODES.find((code) => !byCode.has(code));
  if (missing) {
    throw new Error(`feature_type ${missing} ${MISSING_SUFFIX}`);
  }
  return byCode;
};
