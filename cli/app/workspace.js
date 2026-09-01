import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeColor } from "../lib/color.js";

const firstByApiName = (items, apiName) => items.find((item) => item?.apiName === apiName);

export const findWorkspace = async (client, apiName) => {
  const workspace = firstByApiName(await client.listWorkspaces(), apiName);
  if (!workspace) {
    throw new Error(`Workspace ${apiName} not found`);
  }
  return workspace;
};

const brandingPatch = async (client, { displayName, description, color, logo }) => {
  const patch = {};
  if (displayName) patch.displayName = displayName;
  if (description) patch.description = description;
  if (color) patch.primaryColor = normalizeColor(color);
  if (logo) {
    const logoPath = resolve(logo);
    await access(logoPath);
    patch.logoId = await client.uploadSystemAsset(logoPath);
  }
  return patch;
};

export const ensureWorkspace = async (client, { apiName, displayName, description, color, logo }) => {
  const existing = firstByApiName(await client.listWorkspaces(), apiName);
  const patch = await brandingPatch(client, { displayName, description, color, logo });

  if (existing) {
    const workspace =
      Object.keys(patch).length > 0 ? await client.updateWorkspace(apiName, patch) : existing;
    return { workspace: { ...existing, ...workspace }, created: false };
  }

  const created = await client.createWorkspace({
    apiName,
    displayName: displayName || apiName,
    description,
    primaryColor: patch.primaryColor,
  });

  const workspace =
    patch.logoId ? await client.updateWorkspace(apiName, { logoId: patch.logoId }) : created;

  return { workspace: { ...created, ...workspace }, created: true };
};
