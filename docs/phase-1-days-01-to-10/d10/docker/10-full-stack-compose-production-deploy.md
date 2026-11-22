# Day 10: DevOps & Phase 1 Full-Stack Production Deployment

This manuscript contains the complete, production-hardened 5-container architecture orchestrating **Next.js 15, Node.js API, PostgreSQL, Redis, and Nginx**.

---

## 1. The Production Architecture Diagram

```
[ Public Users ] ──► Port 80/443
                            │
                            ▼
                ┌───────────────────────┐
                │   Nginx Reverse Proxy │
                └───────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Next.js 15 App  │        │   Node.js API    │
    │  (Port 3000)     │        │   (Port 4000)    │
    └──────────────────┘        └─────────┬────────┘
                                          │
                            ┌─────────────┴────────────┐
                            ▼                          ▼
                  ┌──────────────────┐       ┌──────────────────┐
                  │    PostgreSQL    │       │      Redis       │
                  │   (Port 5432)    │       │   (Port 6379)    │
                  └──────────────────┘       └──────────────────┘
```

---

## 2. Production `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # 1. Edge Reverse Proxy & SSL
  nginx:
    image: nginx:alpine
    container_name: prod_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - production-net

  # 2. Next.js 15 Frontend (Standalone Production Build)
  frontend:
    build:
      context: ./web-frontend
      dockerfile: Dockerfile
    container_name: prod_frontend
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.myapp.com
    networks:
      - production-net

  # 3. Node.js Backend API
  backend:
    build:
      context: ./core-backend
      dockerfile: Dockerfile
    container_name: prod_backend
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=postgresql://postgres:secretpassword@postgres:5432/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - production-net

  # 4. PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: prod_postgres
    restart: always
    shm_size: 256mb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - production-net

  # 5. Redis In-Memory Cache & Rate Limiting
  redis:
    image: redis:7-alpine
    container_name: prod_redis
    restart: always
    volumes:
      - redisdata:/data
    networks:
      - production-net

networks:
  production-net:
    driver: bridge

volumes:
  pgdata:
  redisdata:
```

---

## 3. One-Command Production Boot
```bash
# Launch the entire enterprise architecture
docker compose -f docker-compose.prod.yml up -d --build
```
