-- migrate:up
create table benefits.feature_type (
  id uuid not null default gen_random_uuid(),
  code varchar(50) not null,
  constraint pk_feature_type primary key (id)
);

create unique index uk_feature_type_code
  on benefits.feature_type (code);

insert into benefits.feature_type (id, code) values
  ('16df2ea3-8b2a-4cfc-801e-ffb02ba1a963', 'STRING'),
  ('c0de25d4-9210-49fe-b7c3-2ff05bd5d77a', 'BOOLEAN'),
  ('c304e50f-21bf-45ef-acfe-17d1b12b4ced', 'INTEGER'),
  ('bd838348-17af-4117-82da-012b356a1c3a', 'NUMERIC'),
  ('f459873c-0318-481c-ad4d-fd4f04482341', 'DATE');

-- migrate:down
drop table if exists benefits.feature_type;
