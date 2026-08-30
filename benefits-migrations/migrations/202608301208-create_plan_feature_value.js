/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw(`
    create table benefits.plan_feature_value (
      id uuid not null default gen_random_uuid(),
      plan_id uuid null,
      benefit_feature_id uuid not null,
      control_group_id uuid not null,
      boolean_value boolean null,
      string_value varchar(255) null,
      date_value timestamptz null,
      integer_value integer null,
      number_value numeric(11, 2) null,
      link_value varchar(500) null,
      display_value varchar(1000) null,
      from_date date not null,
      to_date date not null,
      constraint pk_plan_feature_value primary key (id),
      constraint fk_plan_feature_value_plan_id
        foreign key (plan_id)
        references benefits.plan (id),
      constraint fk_plan_feature_value_benefit_feature_id
        foreign key (benefit_feature_id)
        references benefits.benefit_feature (id),
      constraint fk_plan_feature_value_control_group_id
        foreign key (control_group_id)
        references benefits.control_group (id)
    );

    create unique index uk_plan_feature_value_feature_plan_dates
      on benefits.plan_feature_value (benefit_feature_id, plan_id, from_date, to_date);

    create unique index uk_plan_feature_value_feature_dates_no_plan
      on benefits.plan_feature_value (benefit_feature_id, from_date, to_date)
      where plan_id is null;

    create index ix_plan_feature_value_plan_id
      on benefits.plan_feature_value (plan_id);

    create index ix_plan_feature_value_plan_id_from_date_to_date
      on benefits.plan_feature_value (plan_id, from_date, to_date);

    create index ix_plan_feature_value_benefit_feature_id
      on benefits.plan_feature_value (benefit_feature_id);

    create index ix_plan_feature_value_control_group_id
      on benefits.plan_feature_value (control_group_id);
  `);
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop table if exists benefits.plan_feature_value");
}
