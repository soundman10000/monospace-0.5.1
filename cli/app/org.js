import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "../client/index.js";

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const normalizeColor = (value) => {
  const hex = String(value).trim().startsWith("#") ? String(value).trim() : `#${String(value).trim()}`;
  if (!HEX_COLOR.test(hex)) {
    throw new Error(`Brand color must be hex like #2663eb (got ${value})`);
  }
  if (hex.length === 4) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return hex.toLowerCase();
};

export const configureOrg = async (input) => {
  if (!input.orgName && !input.orgColor && !input.orgLogo) {
    throw new Error("Set --name, --color, or --logo");
  }

  const client = createClient(input);
  const patch = {};

  if (input.orgName) patch.name = input.orgName;
  if (input.orgColor) patch.color = normalizeColor(input.orgColor);
  if (input.orgLogo) {
    const logoPath = resolve(input.orgLogo);
    await access(logoPath);
    patch.logoId = await client.uploadSystemAsset(logoPath);
  }

  await client.updateOrgSettings(patch);
  const settings = await client.getOrgSettings();

  return {
    url: client.base,
    name: settings.name,
    color: settings.color,
    logoId: settings.logoId || patch.logoId || null,
    logo: settings.logo?.fileName || null,
  };
};
