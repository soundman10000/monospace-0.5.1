import fs from "node:fs/promises";
import path from "node:path";

export const writeCollectionFile = async (outDir, collection, items) => {
  await fs.mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, `${collection}.json`);
  await fs.writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`);
  return filePath;
};
