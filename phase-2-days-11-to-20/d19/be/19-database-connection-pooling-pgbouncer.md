# Day 19: Backend Engineering & Connection Pooling

Each direct connection to PostgreSQL forks an OS process consuming ~10MB RAM. 1,000 serverless Node.js lambdas will crash PostgreSQL with `FATAL: sorry, too many clients already`.

---

## 1. PgBouncer Architecture
**PgBouncer** acts as a lightweight proxy maintaining a pool of ~50 persistent database connections, reusing them across thousands of ephemeral Node.js requests.