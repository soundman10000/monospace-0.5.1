export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const trimSlash = (url) => String(url).replace(/\/$/, "");

export const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const unwrap = (value) => value?.data ?? value;

export const asItem = (value) => {
  const data = unwrap(value);
  return Array.isArray(data) ? data[0] ?? null : data;
};
