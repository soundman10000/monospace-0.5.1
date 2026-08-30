export const mapSeries = async (items, fn) => {
  const results = [];
  for (const [index, item] of items.entries()) {
    results.push(await fn(item, index));
  }
  return results;
};
