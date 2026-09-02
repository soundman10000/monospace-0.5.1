import pg from "pg";

const SCHEMA = "benefits";

export const queryCatalog = async (connectionString, { benefitCode, planCode, controlGroupCode }) => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const benefits = await client.query(
      `
        select b.id, b.code, b.name, b.description, b.display_order
        from ${SCHEMA}.benefit b
        join ${SCHEMA}.control_group g on g.id = b.control_group_id
        where ($1::text is null or b.code = $1)
          and ($2::text is null or g.code = $2)
        order by b.display_order, b.code
      `,
      [benefitCode, controlGroupCode]
    );

    if (benefits.rows.length === 0) {
      throw new Error(
        `No benefit ${benefitCode ?? "*"} found in ${SCHEMA} (control group ${controlGroupCode ?? "any"})`
      );
    }

    const benefitIds = benefits.rows.map((row) => row.id);
    const plans = await client.query(
      `
        select p.id, p.code, p.name, p.description, p.display_order, p.benefit_id
        from ${SCHEMA}.plan p
        where p.benefit_id = any($1::uuid[])
          and ($2::text is null or p.code = $2)
        order by p.display_order, p.code
      `,
      [benefitIds, planCode]
    );

    return { benefits: benefits.rows, plans: plans.rows };
  } finally {
    await client.end();
  }
};
