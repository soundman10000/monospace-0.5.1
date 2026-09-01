import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import { normalizeColor } from "./color.js";

const KNOWN_KEYS = new Set(["collections"]);
const OVERLAY_KEYS = new Set(["isHidden", "displayName", "color", "icon", "description"]);

const requireMapping = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a mapping`);
  }
  return value;
};

const unknownKeys = (value, allowed) => Object.keys(value).filter((key) => !allowed.has(key));

const overlayFrom = (item, dbName) => {
  const mapping = requireMapping(item, `collections.${dbName}`);
  const extra = unknownKeys(mapping, OVERLAY_KEYS);
  if (extra.length) {
    throw new Error(`collections.${dbName} has unknown keys: ${extra.join(", ")}`);
  }
  const overlay = {};
  for (const key of OVERLAY_KEYS) {
    if (mapping[key] === undefined) continue;
    overlay[key] = key === "color" && mapping[key] != null ? normalizeColor(mapping[key]) : mapping[key];
  }
  if (Object.keys(overlay).length === 0) {
    throw new Error(`collections.${dbName} needs a configure field (for example isHidden)`);
  }
  return overlay;
};

export const loadStrategy = async (path) => {
  const file = resolve(path);
  const raw = parse(await readFile(file, "utf8"));
  const mapping = requireMapping(raw ?? {}, `Strategy ${file}`);
  const extra = unknownKeys(mapping, KNOWN_KEYS);
  if (extra.length) {
    throw new Error(`Unknown strategy keys in ${file}: ${extra.join(", ")}`);
  }
  const collections = mapping.collections == null ? {} : requireMapping(mapping.collections, `Strategy collections in ${file}`);
  return {
    file,
    collections: Object.entries(collections).map(([dbName, item]) => ({
      dbName,
      overlay: overlayFrom(item, dbName),
    })),
  };
};
