# Day 5: DevOps & Docker Compose for Multi-Container Architecture

In production and local development, applications never run alone: they depend on databases, caches, and background workers. **Docker Compose** lets you define and manage your entire multi-container infrastructure declaratively in a single `docker-compose.yml` file.

---

## 1. Multi-Container Orchestration Architecture

```
┌────────────────────────────────────────────────────────┐
│               CUSTOM DOCKER BRIDGE NETWORK             │
│                                                        │
│  ┌──────────────────┐           ┌──────────────────┐   │
│  │    web-api       │──────────►│     postgres     │   │
│  │ (Node.js App)    │           │ (Port 5432)      │   │
│  └────────┬─────────┘           └──────────────────┘   │
│           │                                            │
│           │                     ┌──────────────────┐   │
│           └────────────────────►│      redis       │   │
│                                 │ (Port 6379)      │   │
│                                 └──────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### The Power of Docker Compose DNS Service Discovery:
Containers on the same user-defined network do not need hardcoded IP addresses. Docker provides an **internal DNS server**:
* To connect from `web-api` to PostgreSQL, your connection string is simply:
  `postgresql://admin:password@postgres:5432/appdb`
* Docker automatically resolves the hostname `postgres` to the container's private network IP!

---

## 2. Complete Enterprise `docker-compose.yml`

```yaml
version: '3.8'

services:
  # 1. Node.js Backend API
  web-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: web-api-service
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:secret123@postgres:5432/production_db?schema=public
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./src:/usr/src/app/src # Bind mount for live code hot-reload
      - /usr/src/app/node_modules # Preserve container node_modules
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy # Wait until PostgreSQL is READY to accept queries!
      redis:
        condition: service_started

  # 2. PostgreSQL Relational Database
  postgres:
    image: postgres:16-alpine
    container_name: postgres-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret123
      POSTGRES_DB: production_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data # Named volume for persistence
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 3. Redis In-Memory Cache
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  pgdata:
  redisdata:
```

---

## 3. Essential Docker Compose CLI Commands

```bash
# 1. Start all containers in background and build images if missing
docker compose up -d --build

# 2. View streaming logs from all services simultaneously
docker compose logs -f

# 3. View status of all orchestrated services
docker compose ps

# 4. Execute a command inside a running service (e.g. database migration)
docker compose exec web-api npx prisma migrate deploy

# 5. Stop all containers without deleting volume data
docker compose down

# 6. Stop all containers AND delete persistent volumes (Destructive!)
docker compose down -v
```
