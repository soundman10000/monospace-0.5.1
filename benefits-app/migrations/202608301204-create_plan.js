/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw(`
    create table benefits.plan (
      id uuid not null default gen_random_uuid(),
      benefit_id uuid not null,
      control_group_id uuid not null,
      code varchar(4000) not null,
      name varchar(4000) not null,
      description text not null,
      display_order integer not null default 0,
      start_date timestamptz not null,
      modified_by_user_id varchar(200) not null,
      constraint pk_plan primary key (id),
      constraint fk_plan_benefit_id
        foreign key (benefit_id)
        references benefits.benefit (id),
      constraint fk_plan_control_group_id
        foreign key (control_group_id)
        references benefits.control_group (id)
    );

    create unique index uk_plan_benefit_id_code
      on benefits.plan (benefit_id, code);

    create index ix_plan_benefit_id
      on benefits.plan (benefit_id);

    create index ix_plan_control_group_id
      on benefits.plan (control_group_id);
  `);
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop table if exists benefits.plan");
}
