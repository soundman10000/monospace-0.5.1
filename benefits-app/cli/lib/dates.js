export const RANGE_START = "1900-01-01";
export const RANGE_END = "9999-12-31";

const RANGE_SPLIT_2000 = "2000-01-01";
const RANGE_SPLIT_2010 = "2010-01-01";
const RANGE_SPLIT_2020 = "2020-01-01";
const RANGE_SPLIT_2024 = "2024-01-01";
const RANGE_SPLIT_2025 = "2025-01-01";

const RANGE_SPLITS = [
  RANGE_SPLIT_2000,
  RANGE_SPLIT_2010,
  RANGE_SPLIT_2020,
  RANGE_SPLIT_2024,
  RANGE_SPLIT_2025,
];

export const adjacentRanges = (count) => {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("--ranges must be an integer >= 1");
  }
  if (n - 1 > RANGE_SPLITS.length) {
    throw new Error(`--ranges cannot exceed ${RANGE_SPLITS.length + 1}`);
  }

  const bounds = [RANGE_START, ...RANGE_SPLITS.slice(0, n - 1), RANGE_END];
  const ranges = bounds.slice(0, -1).map((from_date, index) => ({
    from_date,
    to_date: bounds[index + 1],
  }));

  const invalid = ranges.slice(1).find((range, index) => range.from_date !== ranges[index].to_date);
  if (invalid) {
    throw new Error("internal error: range from_date does not match prior to_date");
  }

  return ranges;
};
