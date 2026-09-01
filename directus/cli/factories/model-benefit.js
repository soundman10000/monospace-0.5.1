import { clip } from "../lib/text.js";

const CODE_MAX = 255;
const NAME_MAX = 255;
const COLLECTION = "model_benefit";

export const toModelBenefit = (row) => ({
  id: row.id,
  code: clip(row.code, CODE_MAX),
  name: clip(row.name, NAME_MAX),
  description: row.description ?? null,
  sort: row.display_order ?? null,
});

export const collectionName = COLLECTION;
