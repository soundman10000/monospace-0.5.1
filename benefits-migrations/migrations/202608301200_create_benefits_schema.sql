-- migrate:up
create schema if not exists benefits;

-- migrate:down
drop schema if exists benefits cascade;
