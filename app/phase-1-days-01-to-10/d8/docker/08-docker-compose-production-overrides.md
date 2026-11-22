# Day 8: DevOps & Multi-Environment Docker Compose (Overrides & Production Hardening)

In software engineering teams, you should never maintain completely duplicate `docker-compose-dev.yml` and `docker-compose-prod.yml` files that drift apart. Docker Compose provides a native **Layered Inheritance System**.

---

## 1. The Inheritance & Override Model

```
┌────────────────────────────────────────────────────────┐
│ 1. docker-compose.yml (Base File)                      │
│    - Contains shared service definitions               │
│    - Declares image names, networks, volumes, env keys │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼ (Local Dev)               ▼ (Production)
┌──────────────────────────┐   ┌──────────────────────────┐
│ docker-compose.override  │   │ docker-compose.prod.yml  │
│ - Live bind mounts       │   │ - No bind mounts         │
│ - Debug ports opened     │   │ - Strict resource limits │
│ - Hot-reload flags       │   │ - restart: always        │
└──────────────────────────┘   └──────────────────────────┘
```

---

## 2. Base Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  api:
    image: my-enterprise-api:latest
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - DATABASE_URL=postgresql://user:pass@postgres:5432/appdb
    networks:
      - internal-net

networks:
  internal-net:
    driver: bridge
```

---

## 3. Development Overrides (`docker-compose.override.yml`)

Docker automatically merges this file when you run `docker compose up` without flags:

```yaml
version: '3.8'

services:
  api:
    build:
      target: builder # Targets development stage with devDependencies
    ports:
      - "3000:3000"
      - "9229:9229" # Node.js debugger port
    volumes:
      - ./src:/usr/src/app/src # Live hot reload
      - /usr/src/app/node_modules
    command: npm run dev
```

---

## 4. Production Hardening (`docker-compose.prod.yml`)

When deploying to a production server, apply the production override:
`docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

```yaml
version: '3.8'

services:
  api:
    restart: always # Auto-restart container on crash or host reboot
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1024M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3" # Rotate logs: prevents disk from filling up!
```
