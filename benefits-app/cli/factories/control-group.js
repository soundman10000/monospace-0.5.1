import { findOrCreate } from "../lib/db.js";
import { clip, titleize } from "../lib/text.js";

const TABLE = "control_group";
const CODE_MAX = 30;
const NAME_MAX = 50;
const NAME_SUFFIX = "Control Group";

export const upsertControlGroup = (trx, code) => {
  const clippedCode = clip(code, CODE_MAX);
  return findOrCreate(trx, TABLE, { code: clippedCode }, {
    code: clippedCode,
    name: clip(`${titleize(code)} ${NAME_SUFFIX}`, NAME_MAX),
  });
};
