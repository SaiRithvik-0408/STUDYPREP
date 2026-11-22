# Day 20: Backend Engineering & Zero-Downtime Migrations

Never rename a database column directly in production (`ALTER TABLE RENAME COLUMN`).

---

## The 4-Step Expand / Contract Pattern:
1. **Expand**: Add new column (`new_name`), keep old column (`old_name`).
2. **Dual-Write**: Deploy API update writing to BOTH columns simultaneously.
3. **Backfill**: Migrate historical records from old column to new column in batches.
4. **Contract**: Update API to read strictly from `new_name`, and safely drop `old_name`.