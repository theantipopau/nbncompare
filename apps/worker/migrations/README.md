# Migration Convention

- Keep schema and data migrations in this folder only.
- Use zero-padded numeric prefixes in execution order, for example `0042_add_plan_filter_indexes.sql`.
- Prefer forward-only migrations. If a rollback is needed, add a new migration that reverses the earlier change.
- Keep each migration focused on one logical schema or data update.