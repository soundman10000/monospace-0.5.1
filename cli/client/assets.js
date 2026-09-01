import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { asItem } from "./helpers.js";

const MEDIA_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const mediaTypeFor = (fileName) => MEDIA_TYPES[extname(fileName).toLowerCase()] || "application/octet-stream";

export const uploadSystemAsset = async (session, filePath) => {
  const fileName = basename(filePath);
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mediaTypeFor(fileName) }), fileName);

  const response = await fetch(`${session.base}/api/system/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Asset upload failed (${response.status})`);
  }

  const id = asItem(body)?.id;
  if (!id) throw new Error("Asset upload did not return a file id");
  return id;
};
