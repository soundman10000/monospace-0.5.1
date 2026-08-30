import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhere, table } from "../lib/db.js";
import { clip } from "../lib/text.js";

const TABLE = "plan_document";
const CODE_MAX = 30;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 255;
const DESCRIPTION_PREFIX = "for";

const DOCUMENT_SPD = {
  code: "SPD",
  name: "Summary Plan Description",
};

const DOCUMENT_SBC = {
  code: "SBC",
  name: "Summary of Benefits and Coverage",
};

const DOCUMENTS = [DOCUMENT_SPD, DOCUMENT_SBC];

export const upsertPlanDocument = (trx, { group, plan, document }) =>
  findOrCreate(
    trx,
    TABLE,
    { plan_id: plan.id, code: document.code },
    {
      plan_id: plan.id,
      control_group_id: group.id,
      code: clip(document.code, CODE_MAX),
      external_code: clip(document.code, CODE_MAX),
      name: clip(document.name, NAME_MAX),
      description: clip(`${document.name} ${DESCRIPTION_PREFIX} ${plan.code}`, DESCRIPTION_MAX),
    }
  );

export const upsertPlanDocuments = (trx, { group, plan }) =>
  mapSeries(DOCUMENTS, (document) => upsertPlanDocument(trx, { group, plan, document }));

export const listPlanDocumentIds = async (trx, planId) => {
  const rows = await trx(table(TABLE)).where({ plan_id: planId }).select("id");
  return rows.map((row) => row.id);
};

export const removePlanDocuments = (trx, planId) =>
  removeWhere(trx, TABLE, { plan_id: planId });
