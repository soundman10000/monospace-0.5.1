-- migrate:up
create table benefits.plan_document (
  id uuid not null default gen_random_uuid(),
  plan_id uuid not null,
  control_group_id uuid not null,
  code varchar(30) not null,
  external_code varchar(30) not null,
  name varchar(50) not null,
  description varchar(255) not null,
  constraint pk_plan_document primary key (id),
  constraint fk_plan_document_plan_id
    foreign key (plan_id)
    references benefits.plan (id),
  constraint fk_plan_document_control_group_id
    foreign key (control_group_id)
    references benefits.control_group (id)
);

create unique index uk_plan_document_plan_id_code
  on benefits.plan_document (plan_id, code);

create unique index uk_plan_document_plan_id_external_code
  on benefits.plan_document (plan_id, external_code);

create index ix_plan_document_plan_id
  on benefits.plan_document (plan_id);

create index ix_plan_document_control_group_id
  on benefits.plan_document (control_group_id);

-- migrate:down
drop table if exists benefits.plan_document;
