# Day 11: Backend Engineering & PostgreSQL Relational Modeling

In enterprise software engineering, poor schema design causes data anomalies, duplicate records, and painful migrations.

---

## 1. Database Normalization (1NF $\to$ 3NF)

```
Unnormalized Data ──► [ 1NF: Atomic Cells ] ──► [ 2NF: No Partial Deps ] ──► [ 3NF: No Transitive Deps ]
```

1. **First Normal Form (1NF)**:
   * Every column must hold atomic (indivisible) values. No comma-separated strings (`roles = "admin,editor"`). Use junction tables or PostgreSQL native array types.
   * Each record must have a unique Primary Key.
2. **Second Normal Form (2NF)**:
   * Satisfies 1NF.
   * Every non-key column must depend on the **entire Primary Key**, not just part of a composite key.
3. **Third Normal Form (3NF)**:
   * Satisfies 2NF.
   * No transitive dependencies: non-key columns must not depend on other non-key columns.

---

## 2. Foreign Keys & Cascading Rules

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  CONSTRAINT fk_organization FOREIGN KEY (org_id) 
    REFERENCES organizations(id) ON DELETE CASCADE
);
```