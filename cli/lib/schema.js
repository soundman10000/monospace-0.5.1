import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const loadSchema = async (path) => {
  const file = resolve(path);
  const raw = JSON.parse(await readFile(file, "utf8"));
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.operations)) {
    throw new Error(`Schema ${file} must be a mapping with an operations list`);
  }
  return { file, operations: raw.operations };
};

const named = (item, name) => item.dbName === name || item.apiName === name;

const idOf = (items, name, where) => {
  const matches = items.filter((item) => named(item, name) && (!where || where(item)));
  if (matches.length !== 1) {
    throw new Error(`${name} ${matches.length ? "is not unique" : "not found"}`);
  }
  return matches[0].id;
};

export const bindOperation = (operation, { collections, primitives }) => {
  const bound = structuredClone(operation);
  for (const field of [bound.data.data.firstField, bound.data.data.secondField]) {
    field.id ??= randomUUID();
    field.collectionId = idOf(collections, field.collectionId);
    field.fieldIds = field.fieldIds.map((name) =>
      idOf(primitives, name, (item) => item.collectionId === field.collectionId),
    );
    delete field.meta;
  }
  return bound;
};
