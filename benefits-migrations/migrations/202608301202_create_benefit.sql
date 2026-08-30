-- migrate:up
create table benefits.benefit (
  id uuid not null default gen_random_uuid(),
  control_group_id uuid not null,
  code varchar(30) not null,
  name varchar(50) not null,
  description varchar(255) not null,
  display_order integer not null default 0,
  start_date timestamptz not null,
  modified_by_user_id varchar(200) not null,
  constraint pk_benefit primary key (id),
  constraint fk_benefit_control_group_id
    foreign key (control_group_id)
    references benefits.control_group (id)
);

create unique index uk_benefit_control_group_id_code
  on benefits.benefit (control_group_id, code);

create index ix_benefit_control_group_id
  on benefits.benefit (control_group_id);

-- migrate:down
drop table if exists benefits.benefit;
