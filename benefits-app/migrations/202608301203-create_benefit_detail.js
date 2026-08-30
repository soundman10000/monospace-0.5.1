/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw(`
    create table benefits.benefit_detail (
      id uuid not null default gen_random_uuid(),
      benefit_id uuid not null,
      control_group_id uuid not null,
      enabled boolean not null default true,
      from_date date not null,
      to_date date not null,
      start_date timestamptz not null,
      modified_by_user_id varchar(200) not null,
      constraint pk_benefit_detail primary key (id),
      constraint fk_benefit_detail_benefit_id
        foreign key (benefit_id)
        references benefits.benefit (id),
      constraint fk_benefit_detail_control_group_id
        foreign key (control_group_id)
        references benefits.control_group (id)
    );

    create unique index uk_benefit_detail_benefit_id_from_date_to_date
      on benefits.benefit_detail (benefit_id, from_date, to_date);

    create index ix_benefit_detail_benefit_id
      on benefits.benefit_detail (benefit_id);

    create index ix_benefit_detail_control_group_id
      on benefits.benefit_detail (control_group_id);
  `);
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop table if exists benefits.benefit_detail");
}
