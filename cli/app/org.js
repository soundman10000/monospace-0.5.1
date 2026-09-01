import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeColor } from "../lib/color.js";

export const configureOrg = async (client, { name, color, logo }) => {
  if (!name && !color && !logo) {
    throw new Error("Set --name, --color, or --logo");
  }

  const patch = {};

  if (name) patch.name = name;
  if (color) patch.color = normalizeColor(color);
  if (logo) {
    const logoPath = resolve(logo);
    await access(logoPath);
    patch.logoId = await client.uploadSystemAsset(logoPath);
  }

  await client.updateOrgSettings(patch);
  const settings = await client.getOrgSettings();

  return {
    name: settings.name,
    color: settings.color,
    logoId: settings.logoId || patch.logoId || null,
    logo: settings.logo?.fileName || null,
  };
};
