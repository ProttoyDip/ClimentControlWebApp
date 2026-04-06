# MySQL Migrations

This folder uses paired migration files:
- `<version>_<name>.up.sql`
- `<version>_<name>.down.sql`

Examples:
- `001_initial_schema.up.sql`
- `001_initial_schema.down.sql`

Use backend scripts:
- `npm run migrate:up --workspace backend`
- `npm run migrate:down --workspace backend`

Optional target version:
- `npm run migrate:up --workspace backend -- --to=002`
- `npm run migrate:down --workspace backend -- --to=001`
