# Day 7: DevOps & Hardening PostgreSQL Containers (Healthchecks & Init Scripts)

In production full-stack setups, launching a PostgreSQL container with `image: postgres` is only the first step. You must handle **automated schema initialization**, **shared memory sizing**, and **healthcheck dependency orchestration**.

---

## 1. The Startup Race Condition Problem

In Docker Compose, if your Node.js API specifies:
```yaml
depends_on:
  - postgres
```
Docker starts the `postgres` container and **immediately starts the `web-api` container**.
* However, PostgreSQL takes 3 to 8 seconds to initialize its storage engine and open port 5432.
* Node.js attempts to connect on second 1, crashes with `ECONNREFUSED`, and exits!

### The Solution: `healthcheck` + `condition: service_healthy`
```yaml
services:
  web-api:
    depends_on:
      postgres:
        condition: service_healthy # Node.js WAITS until Postgres is fully ready!

  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 3s
      timeout: 3s
      retries: 5
```

---

## 2. Automated Database Initialization (`init.sql`)

The official PostgreSQL Docker image checks the directory `/docker-entrypoint-initdb.d/` on first launch. Any SQL files mounted here execute automatically:

```sql
-- init-db.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Mounting the Init Script in Docker Compose:
```yaml
postgres:
  image: postgres:16-alpine
  volumes:
    - pgdata:/var/lib/postgresql/data
    - ./init-db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro # Read-only mount!
```

---

## 3. Shared Memory Tuning (`shm_size`)

By default, Docker allocates only **64 MB** of POSIX shared memory (`/dev/shm`) to containers.
* PostgreSQL uses shared memory for parallel workers and complex hash joins.
* If a query executes a large join or aggregate on a table of 100,000+ rows, PostgreSQL crashes with `ERROR: could not resize shared memory segment (No space left on device)`.
* **Fix**: Always specify `shm_size: 256mb` (or `512mb`) in `docker-compose.yml`:

```yaml
postgres:
  image: postgres:16-alpine
  shm_size: 256mb # Allocates sufficient shared memory for parallel query execution
```
