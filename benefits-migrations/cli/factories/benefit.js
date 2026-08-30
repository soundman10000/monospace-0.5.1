import { findOrCreate } from "../lib/db.js";
import { clip, titleize } from "../lib/text.js";

const TABLE = "benefit";
const CODE_MAX = 30;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 255;
const DISPLAY_ORDER = 0;
const DESCRIPTION_SUFFIX = "benefit catalog";
const MODIFIED_BY_USER_ID = "hydrate-cli";

export const upsertBenefit = (trx, { group, code, startDate }) => {
  const clippedCode = clip(code, CODE_MAX);
  return findOrCreate(
    trx,
    TABLE,
    { control_group_id: group.id, code: clippedCode },
    {
      control_group_id: group.id,
      code: clippedCode,
      name: clip(titleize(code), NAME_MAX),
      description: clip(`${titleize(code)} ${DESCRIPTION_SUFFIX}`, DESCRIPTION_MAX),
      display_order: DISPLAY_ORDER,
      start_date: startDate,
      modified_by_user_id: MODIFIED_BY_USER_ID,
    }
  );
};
