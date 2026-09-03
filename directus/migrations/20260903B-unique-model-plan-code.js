export default {
  async up(knex) {
    await knex.raw(`
      create unique index uk_model_plan_benefit_code
        on model_plan (benefit, code)
    `);
  },

  async down(knex) {
    await knex.raw("drop index if exists uk_model_plan_benefit_code");
  },
};
