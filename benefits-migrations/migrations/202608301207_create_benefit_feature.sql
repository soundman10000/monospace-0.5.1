-- migrate:up
create table benefits.benefit_feature (
  id uuid not null default gen_random_uuid(),
  benefit_id uuid not null,
  control_group_id uuid not null,
  feature_type_id uuid not null,
  code varchar(30) not null,
  external_code varchar(30) null,
  name varchar(50) not null,
  description varchar(255) null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  constraint pk_benefit_feature primary key (id),
  constraint fk_benefit_feature_benefit_id
    foreign key (benefit_id)
    references benefits.benefit (id),
  constraint fk_benefit_feature_control_group_id
    foreign key (control_group_id)
    references benefits.control_group (id),
  constraint fk_benefit_feature_feature_type_id
    foreign key (feature_type_id)
    references benefits.feature_type (id)
);

create unique index uk_benefit_feature_benefit_id_code
  on benefits.benefit_feature (benefit_id, code);

create unique index uk_benefit_feature_benefit_id_external_code
  on benefits.benefit_feature (benefit_id, external_code)
  where external_code is not null;

create index ix_benefit_feature_benefit_id
  on benefits.benefit_feature (benefit_id);

create index ix_benefit_feature_control_group_id
  on benefits.benefit_feature (control_group_id);

create index ix_benefit_feature_feature_type_id
  on benefits.benefit_feature (feature_type_id);

-- migrate:down
drop table if exists benefits.benefit_feature;
