/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.raw(`
    create table benefits.plan_document_detail (
      id uuid not null default gen_random_uuid(),
      plan_document_id uuid not null,
      control_group_id uuid not null,
      from_date date not null,
      to_date date not null,
      enabled boolean not null default true,
      display_order integer not null default 0,
      display_value varchar(1000) null,
      file_name varchar(255) null,
      constraint pk_plan_document_detail primary key (id),
      constraint fk_plan_document_detail_plan_document_id
        foreign key (plan_document_id)
        references benefits.plan_document (id),
      constraint fk_plan_document_detail_control_group_id
        foreign key (control_group_id)
        references benefits.control_group (id)
    );

    create unique index uk_plan_document_detail_plan_document_id_from_date_to_date
      on benefits.plan_document_detail (plan_document_id, from_date, to_date);

    create index ix_plan_document_detail_plan_document_id
      on benefits.plan_document_detail (plan_document_id);

    create index ix_plan_document_detail_control_group_id
      on benefits.plan_document_detail (control_group_id);
  `);
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.raw("drop table if exists benefits.plan_document_detail");
}
