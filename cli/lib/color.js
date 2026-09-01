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
