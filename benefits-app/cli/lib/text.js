export const clip = (value, max) => String(value).slice(0, max);

export const titleize = (value) =>
  String(value)
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
