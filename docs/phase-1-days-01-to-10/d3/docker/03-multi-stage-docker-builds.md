# Day 3: Multi-Stage Production Docker Builds & Container Healthchecks

In enterprise environments, pushing 1GB+ development images into Kubernetes or production ECS clusters causes severe network saturation, slow deployment rollouts, and introduces security vulnerabilities from dev tools.

This guide details **Multi-Stage Builds**: how to compile your TypeScript applications in an isolated build container and output an ultra-lightweight ~120MB runner container.

---

## 1. Single-Stage vs Multi-Stage Dockerfile

```
┌────────────────────────────────────────────────────────┐
│             SINGLE-STAGE BUILD (Bad Practice)          │
├────────────────────────────────────────────────────────┤
│ - Base Node.js image                                   │
│ - Copies source code & devDependencies (tsc, test libs)│
│ - Runs npm run build                                   │
│ - Ships EVERYTHING to production (~1.2 GB!)            │
└────────────────────────────────────────────────────────┘
                           vs
┌────────────────────────────────────────────────────────┐
│             MULTI-STAGE BUILD (Production Standard)    │
├────────────────────────────────────────────────────────┤
│ STAGE 1: Builder Container                             │
│   - Installs full devDependencies                      │
│   - Compiles TypeScript to JavaScript (dist/)          │
│   - Runs tests & linters                               │
├────────────────────────────────────────────────────────┤
│ STAGE 2: Lightweight Runner Container                  │
│   - Fresh Alpine base (~130 MB)                        │
│   - Copies ONLY dist/ and production node_modules      │
│   - Zero compiler tools, zero test libraries           │
│   - Ships minimal, hardened artifact to production     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Production Multi-Stage Dockerfile (TypeScript + Node.js)

```dockerfile
# ==========================================
# STAGE 1: Build & Compilation Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install ALL dependencies (including TypeScript, @types/*)
RUN npm ci

# Copy application source code
COPY src/ ./src/

# Compile TypeScript into JavaScript (outputs to /usr/src/app/dist)
RUN npm run build

# Remove devDependencies to keep only production packages
RUN npm prune --production

# ==========================================
# STAGE 2: Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Security: Run as non-root unprivileged user
USER node

# Copy production node_modules from builder stage
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

# Copy compiled JavaScript output from builder stage
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package.json ./package.json

# Document listening port
EXPOSE 3000

# Docker Healthcheck: Ensures container is healthy before routing traffic
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Execute node directly (ensures SIGTERM is handled properly)
CMD ["node", "dist/server.js"]
```

---

## 3. The `HEALTHCHECK` Directive Explained

Cloud load balancers and orchestrators must know if an application is actually healthy or frozen in an event loop deadlock.

### Parameters:
* `--interval=30s`: Run the health check every 30 seconds.
* `--timeout=3s`: If the endpoint doesn't respond in 3 seconds, fail the check.
* `--start-period=5s`: Grace period during container boot time before failures count.
* `--retries=3`: Mark container as `unhealthy` after 3 consecutive failures.

---

## 4. Measuring the Difference
Run these commands locally to inspect the savings:
```bash
# Build multi-stage image
docker build -t api-service:prod .

# View image size
docker images api-service:prod
# Output: ~135MB (vs 1.2GB without multi-stage)
```
