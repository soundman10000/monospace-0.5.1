-- migrate:up
create table benefits.control_group (
  id uuid not null default gen_random_uuid(),
  code varchar(30) not null,
  name varchar(50) not null,
  constraint pk_control_group primary key (id)
);

create unique index uk_control_group_code
  on benefits.control_group (code);

-- migrate:down
drop table if exists benefits.control_group;
