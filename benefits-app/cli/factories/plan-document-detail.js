import { mapSeries } from "../lib/async.js";
import { findOrCreate, removeWhereIn } from "../lib/db.js";
import { clip } from "../lib/text.js";

const TABLE = "plan_document_detail";
const ENABLED = true;
const DISPLAY_VALUE_MAX = 1000;
const FILE_NAME_MAX = 255;
const FILE_EXTENSION = "pdf";

export const upsertPlanDocumentDetail = (trx, { group, plan, document, range, order }) =>
  findOrCreate(
    trx,
    TABLE,
    {
      plan_document_id: document.id,
      from_date: range.from_date,
      to_date: range.to_date,
    },
    {
      plan_document_id: document.id,
      control_group_id: group.id,
      from_date: range.from_date,
      to_date: range.to_date,
      enabled: ENABLED,
      display_order: order,
      display_value: clip(`${document.name} ${range.from_date}`, DISPLAY_VALUE_MAX),
      file_name: clip(
        `${plan.code}-${document.code}-${range.from_date}.${FILE_EXTENSION}`.toLowerCase(),
        FILE_NAME_MAX
      ),
    }
  );

export const upsertPlanDocumentDetails = (trx, { group, plan, documents, ranges }) =>
  mapSeries(documents, (document) =>
    mapSeries(ranges, (range, order) =>
      upsertPlanDocumentDetail(trx, { group, plan, document, range, order })
    )
  ).then((groups) => groups.flat());

export const removePlanDocumentDetails = (trx, documentIds) =>
  removeWhereIn(trx, TABLE, "plan_document_id", documentIds);
