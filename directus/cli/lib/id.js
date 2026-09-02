import { createHash } from "node:crypto";

export const hash = (value) => {
  let h = 0;
  for (const char of String(value)) {
    h = (h * 31 + char.charCodeAt(0)) >>> 0;
  }
  return h;
};

export const uuidFrom = (seed) => {
  const bytes = createHash("sha1").update(String(seed)).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export const pick = (list, seed) => list[hash(seed) % list.length];
