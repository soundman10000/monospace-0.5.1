/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw(`
    create table benefits.plan_detail (
      id uuid not null default gen_random_uuid(),
      plan_id uuid not null,
      control_group_id uuid not null,
      enabled boolean not null default true,
      from_date date not null,
      to_date date not null,
      start_date timestamptz not null,
      modified_by_user_id varchar(200) not null,
      constraint pk_plan_detail primary key (id),
      constraint fk_plan_detail_plan_id
        foreign key (plan_id)
        references benefits.plan (id)
    );

    create unique index uk_plan_detail_plan_id_from_date_to_date
      on benefits.plan_detail (plan_id, from_date, to_date);

    create index ix_plan_detail_plan_id
      on benefits.plan_detail (plan_id);

    create index ix_plan_detail_control_group_id
      on benefits.plan_detail (control_group_id);
  `);
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop table if exists benefits.plan_detail");
}
