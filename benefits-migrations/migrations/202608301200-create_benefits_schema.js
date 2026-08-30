/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw("create schema if not exists benefits");
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop schema if exists benefits cascade");
}
