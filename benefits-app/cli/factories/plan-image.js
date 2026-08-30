import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere } from "../lib/db.js";
import { clip } from "../lib/text.js";

const TABLE = "plan_image";
const CODE_MAX = 30;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 255;
const FILE_NAME_MAX = 255;
const FILE_EXTENSION = "png";
const DESCRIPTION_PREFIX = "for";

const IMAGE_LOGO = {
  code: "LOGO",
  name: "Plan Logo",
};

const IMAGE_BANNER = {
  code: "BANNER",
  name: "Plan Banner",
};

const IMAGES = [IMAGE_LOGO, IMAGE_BANNER];

export const upsertPlanImage = (trx, { group, plan, image }) =>
  findOrCreate(
    trx,
    TABLE,
    { plan_id: plan.id, code: image.code },
    {
      plan_id: plan.id,
      control_group_id: group.id,
      code: clip(image.code, CODE_MAX),
      external_code: clip(image.code, CODE_MAX),
      name: clip(image.name, NAME_MAX),
      description: clip(`${image.name} ${DESCRIPTION_PREFIX} ${plan.code}`, DESCRIPTION_MAX),
      file_name: clip(`${plan.code}-${image.code}.${FILE_EXTENSION}`.toLowerCase(), FILE_NAME_MAX),
    }
  );

export const upsertPlanImages = (trx, { group, plan }) =>
  mapSeries(IMAGES, (image) => upsertPlanImage(trx, { group, plan, image }));

export const removePlanImages = (trx, planId) =>
  removeWhere(trx, TABLE, { plan_id: planId });
