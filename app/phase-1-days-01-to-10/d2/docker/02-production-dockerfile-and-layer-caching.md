# Day 2: DevOps & Writing Production Dockerfiles

In production and interviews, simply knowing how to write a basic `Dockerfile` is not enough. You must understand layer optimization, base image selection, `.dockerignore`, and container security.

---

## 1. Choosing the Right Base Image

When selecting a base image for Node.js:

| Base Image | Typical Size | Package Manager | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| `node:20` | ~1.1 GB | `apt` (glibc) | Contains all build tools (python, make, gcc) | Bloated, huge attack surface, slow CI pulls |
| `node:20-slim` | ~240 MB | `apt` (glibc) | Smaller, full glibc compatibility for native C++ modules | Slightly larger than alpine |
| `node:20-alpine` | ~140 MB | `apk` (musl libc) | **Smallest size**, fastest boot time, minimal attack surface | Native C++ binaries (e.g. `sharp`, `bcrypt`) need compilation flags |

* **Production Recommendation**: Use `node:20-alpine` for standard full-stack apps. If you encounter issues compiling native C++ binaries, use `node:20-slim`.

---

## 2. The `.dockerignore` File

Before Docker builds an image, the CLI sends the entire directory contents (the **Build Context**) to the Docker daemon. If you don't have a `.dockerignore` file, you risk sending gigabytes of local `node_modules` and leaking secret `.env` files into the image layers.

### Essential `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
dist
coverage
README.md
.DS_Store
```

---

## 3. Production Dockerfile: Line-by-Line Architecture

Here is the industry-standard single-stage production Dockerfile:

```dockerfile
# 1. Use specific version with lightweight alpine base
FROM node:20-alpine

# 2. Set node environment to production
ENV NODE_ENV=production

# 3. Create app directory
WORKDIR /usr/src/app

# 4. Copy dependency manifests FIRST (Optimizes layer caching!)
COPY package*.json ./

# 5. Install ONLY production dependencies using npm ci (clean install)
RUN npm ci --only=production && npm cache clean --force

# 6. Copy application source code (Changes frequently)
COPY . .

# 7. Security: Switch from root to unprivileged node user
USER node

# 8. Document the listening port
EXPOSE 3000

# 9. Execute node directly (Avoid 'npm start' to allow PID 1 signal forwarding)
CMD ["node", "server.js"]
```

---

## 4. Why You Must Never Run Containers as Root

By default, Docker containers run as the `root` user (`UID 0`).
* If a remote attacker exploits an arbitrary code execution vulnerability in your Express app (e.g. through a vulnerable npm package), they will have **root privileges inside the container**.
* If a container breakout vulnerability exists in the Linux kernel or Docker daemon, the attacker immediately gains **root access to the underlying host server**!
* **Remedy**: Always add `USER node` before the `CMD` instruction.

---

## 5. Avoiding the `npm start` Trap (PID 1 Signal Forwarding)

When a container orchestrator (Kubernetes, AWS ECS, Docker Compose) shuts down a container, it sends a `SIGTERM` signal giving the app a graceful shutdown window (typically 30 seconds to finish in-flight HTTP requests and close database connections).

* If you use `CMD ["npm", "start"]`:
  * `npm` runs as `PID 1`.
  * `npm` **does NOT forward OS signals** (`SIGTERM`, `SIGINT`) to the underlying Node.js child process!
  * Node never receives the shutdown signal, cannot close DB connections cleanly, and is forcefully killed after 30 seconds (`SIGKILL`).
* **Correct Practice**: Always invoke node directly: `CMD ["node", "server.js"]`.
