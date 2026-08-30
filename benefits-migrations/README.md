# Benefits catalog Postgres migrations

Ordered SQL migrations for a single benefits catalog model. Source of truth was:

- Empyrean FluentMigrator baseline + instance migrations
- SQL Express `.\sqlexpress` catalog `devco_local` (`dbo` and `Benefits`)

Knex applies files in `migrations/` and records them in `knex_migrations`.

## Model

```
control_group
  └── benefit
        ├── benefit_detail
        ├── benefit_feature ──► feature_type
        └── plan
              ├── plan_detail
              ├── plan_feature_value ──► benefit_feature
              ├── plan_document
              │     └── plan_document_detail
              └── plan_image
```

There is no separate `plan_feature` table in SQL Server. Plan features are `plan_feature_value` rows keyed by `plan_id` + `benefit_feature_id`.

`control_group` is the aggregate root. It combines:

| SQL Server | Role |
|---|---|
| `dbo.CONTROLLED_GROUP` | Natural key `CONTROL_ID` and `NAME` |
| `dbo.CONTROLLED_GROUP_UUID_MAPPING` | UUID `CONTROL_UUID` and modified-on stamps |
| `Benefits.Client` | UUID `Id`, `InternalCode`, `Name` |

`Benefits.Benefit` / `Benefits.Plan` are thin projections of `dbo.BENEFIT` / `dbo.PLAN`. This model keeps the dbo columns and hangs the Benefits feature/document graph off the same rows.

## Conventions

- Primary key is always `id uuid`
- Foreign keys are namespaced from the parent: `plan.id` → `plan_id`, `benefit.id` → `benefit_id`, `control_group.id` → `control_group_id`
- Natural keys are `code`, never the primary key
- Unique indexes on `code` (scoped to parent when the code is not globally unique)
- No composite primary keys
- Every FK is indexed
- Unique constraints are unique indexes, not composite keys
- Child tables keep `control_group_id` for tenant scoping
- Matrix / tier / vendor / script ids on details are stored as uuid columns without FKs until those catalogs are modeled

## Run

Postgres from this repo's `docker-compose.yaml` is on host port `5434`.

```powershell
cd C:\Code\monospace-0.5.1\benefits-migrations
copy .env.example .env
npm install
npm run migrate:status
npm run migrate
```

Commands:

```powershell
npm run migrate            # apply all pending
npm run migrate:down       # revert the last batch
npm run migrate:status     # list applied and pending
npx knex migrate:make name # scaffold a new migration
```

Default URL: `postgres://postgres:monospace@localhost:5434/benefits`

`ensure-database.js` creates the `benefits` database if it is missing. Docker Compose runs `knex migrate:latest` on every Monospace container start.

## Version table

Knex owns `public.knex_migrations` and `public.knex_migrations_lock`.

New files should be named `{YYYYMMDDHHMMSS}_{description}.js` and export `up` / `down`.

## Migration files

| File | Creates |
|---|---|
| `202608301200_create_benefits_schema.js` | `benefits` schema |
| `202608301201_create_control_group.js` | `control_group` |
| `202608301202_create_benefit.js` | `benefit` |
| `202608301203_create_benefit_detail.js` | `benefit_detail` |
| `202608301204_create_plan.js` | `plan` |
| `202608301205_create_plan_detail.js` | `plan_detail` |
| `202608301206_create_feature_type.js` | `feature_type` + seed rows |
| `202608301207_create_benefit_feature.js` | `benefit_feature` |
| `202608301208_create_plan_feature_value.js` | `plan_feature_value` |
| `202608301209_create_plan_document.js` | `plan_document` |
| `202608301210_create_plan_document_detail.js` | `plan_document_detail` |
| `202608301211_create_plan_image.js` | `plan_image` |

Each file exports Knex `up` / `down` functions.
