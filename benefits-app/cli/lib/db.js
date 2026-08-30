export const SCHEMA = "benefits";

export const table = (name) => `${SCHEMA}.${name}`;

export const findOne = (trx, name, where) => trx(table(name)).where(where).first();

export const insertOne = async (trx, name, attrs) => {
  const [row] = await trx(table(name)).insert(attrs).returning("*");
  return row;
};

export const findOrCreate = async (trx, name, where, attrs) => {
  const existing = await findOne(trx, name, where);
  return existing ?? insertOne(trx, name, attrs);
};

export const removeWhere = (trx, name, where) => trx(table(name)).where(where).del();

export const removeWhereIn = (trx, name, column, ids) => {
  if (ids.length === 0) {
    return Promise.resolve(0);
  }
  return trx(table(name)).whereIn(column, ids).del();
};
