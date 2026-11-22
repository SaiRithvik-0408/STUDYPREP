# Day 4: DevOps & Docker Data Persistence (Volumes & Mounts)

By default, Docker container filesystems are **ephemeral**. When a container is deleted via `docker rm`, all data written inside that container (like database records in PostgreSQL or uploaded user images) is **permanently destroyed**.

This guide details how Docker handles data persistence across container rebuilds.

---

## 1. The 3 Types of Storage Mounts in Docker

```
┌────────────────────────────────────────────────────────┐
│                      HOST MACHINE                      │
│                                                        │
│  ┌──────────────────────────┐  ┌────────────────────┐  │
│  │ Named Volume Storage     │  │ Host Filesystem    │  │
│  │ (/var/lib/docker/volumes)│  │ (/home/user/my-app)│  │
│  └─────────────┬────────────┘  └─────────┬──────────┘  │
│                │                         │             │
│        (Named Volume)              (Bind Mount)        │
│                │                         │             │
│                ▼                         ▼             │
│        ┌───────────────────────────────────────┐       │
│        │          RUNNING CONTAINER            │       │
│        │  Mount Path: /var/lib/postgresql/data │       │
│        └───────────────────────────────────────┘       │
└────────────────────────────────────────────────────────┘
```

| Mount Type | Stored On Host | Managed By | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Named Volume** | `/var/lib/docker/volumes/<name>` | Docker Daemon | **Databases (PostgreSQL, MongoDB, Redis)**. Highly performant, completely decoupled from container lifecycles. |
| **Bind Mount** | Any arbitrary host directory (e.g. `./src`) | The Developer / Host OS | **Local Development**. Hot-reloading source code into a container without rebuilding the image. |
| **`tmpfs` Mount** | Host System RAM | Linux Kernel | Temporary sensitive secrets or session tokens that must never touch persistent disk storage. |

---

## 2. Using Named Volumes (Production Database Standard)

When running a database container like PostgreSQL or MongoDB, you **must mount a volume** to its internal data directory:

```bash
# 1. Create a dedicated named volume
docker volume create pgdata

# 2. Run PostgreSQL mounting the volume to its internal storage path
docker run -d \
  --name production-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=appdb \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

### The Destruction Test:
* If you run `docker rm -f production-postgres`, the container is completely deleted.
* When you launch a brand new container mounting `pgdata`, **100% of your database tables and records are intact!**

---

## 3. Using Bind Mounts for Local Development Hot-Reloading

During local full-stack development, you don't want to run `docker build` every time you change a line of code in `src/`. You use a **Bind Mount**:

```bash
docker run -d \
  --name api-dev \
  -p 3000:3000 \
  -v $(pwd)/src:/usr/src/app/src \
  -v /usr/src/app/node_modules \
  api-service:dev
```

### Why the second `-v /usr/src/app/node_modules` is critical:
Without it, your host's local directory would overwrite the container's `/usr/src/app/`, deleting the Linux-compiled `node_modules` folder inside the container! An anonymous volume preserves the container's internal `node_modules`.

---

## 4. Volume Maintenance Commands

```bash
# List all active volumes
docker volume ls

# Inspect physical disk location of a volume
docker volume inspect pgdata

# Remove unused volumes (Reclaims disk space)
docker volume prune -f
```
