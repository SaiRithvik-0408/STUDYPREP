# Day 1: DevOps & Docker Fundamentals

Containerization is a mandatory skill for modern software engineers. In interviews, you are expected to know not just how to run Docker, but how containers work under the hood in the Linux kernel.

---

## 1. Containers vs Virtual Machines (VMs)

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│           VIRTUAL MACHINE            │     │           DOCKER CONTAINER           │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ App A           │ App B              │     │ App A           │ App B              │
├─────────────────┼────────────────────┤     ├─────────────────┼────────────────────┤
│ Bins / Libs     │ Bins / Libs        │     │ Bins / Libs     │ Bins / Libs        │
├─────────────────┼────────────────────┤     ├─────────────────┴────────────────────┤
│ Guest OS (Linux)│ Guest OS (Ubuntu)  │     │ Container Engine (Containerd / Runc) │
├─────────────────┴────────────────────┤     ├──────────────────────────────────────┤
│ Hypervisor (Type 1 or Type 2)        │     │ Host Operating System (Shared Kernel)│
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ Host Operating System                │     │ Physical Hardware                    │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

### The Architectural Difference:
* **Virtual Machine (VM)**: Virtualizes physical hardware. Each VM boots a complete, independent **Guest Operating System**. This consumes gigabytes of memory and takes 30-90 seconds to boot.
* **Docker Container**: Virtualizes the operating system. All containers **share the host machine's Linux kernel**. They run as isolated processes on the host. They start in milliseconds and use megabytes of RAM.

---

## 2. The Linux Kernel Primitives Behind Containers

Docker is not a hypervisor. It is a wrapper around three core Linux kernel features:

### 1. Namespaces (Isolation)
Namespaces give each container its own isolated view of the operating system:
* **`pid` namespace**: Process isolation. Inside the container, your Node.js app runs as `PID 1`. On the host server, it runs as `PID 48212`.
* **`net` namespace**: Network isolation. Each container has its own virtual network interface, IP address, and port space.
* **`mnt` namespace**: File system isolation. The container only sees its own filesystem root (`/`), completely unaware of the host machine's disk.
* **`ipc` namespace**: Prevents containers from reading each other's inter-process shared memory.

### 2. Cgroups / Control Groups (Resource Throttling)
Namespaces isolate **what a process can see**. Cgroups restrict **how much physical resources a process can use**:
* Limits maximum memory (e.g. `--memory="512m"`). If the app exceeds this, the kernel triggers an OOM-killer.
* Limits CPU allocation (e.g. `--cpus="1.5"`).

### 3. Union File System (UnionFS)
UnionFS allows files and directories from separate layers to be transparently overlaid on top of each other, forming a single coherent filesystem view.

---

## 3. The Docker Engine Architecture

When you type `docker run` in your terminal:

```
[ Docker CLI ] (Client)
      │
      ▼ (REST API over Unix Domain Socket)
[ dockerd ] (Docker Daemon - High-level management)
      │
      ▼ (gRPC)
[ containerd ] (Container Lifecycle Supervisor)
      │
      ▼
[ runc ] (Low-level OCI runtime that interfaces with Linux Kernel)
      │
      ▼
[ Isolated Container Process ]
```

---

## 4. Understanding Image Layers & Caching

Every line in a `Dockerfile` creates a **read-only layer**:

```dockerfile
FROM node:20-alpine          # Layer 1: Base Alpine Linux + Node runtime (~130MB)
WORKDIR /app                 # Layer 2: Metadata instruction
COPY package*.json ./        # Layer 3: Copies manifest files
RUN npm install              # Layer 4: Installs node_modules
COPY . .                     # Layer 5: Copies application code
```

### Why Layer Order Matters:
Docker caches layers from top to bottom.
* If you edit a single TypeScript file in `src/`, **Layer 5 changes**.
* Because Layer 3 (`COPY package*.json`) and Layer 4 (`RUN npm install`) did not change, Docker reuses their cached results instantly!
* If you placed `COPY . .` before `RUN npm install`, every single code edit would bust the cache and force `npm install` to run from scratch.

---

## 5. Daily Docker CLI Cheat Sheet

```bash
# 1. Pull an image from Docker Hub
docker pull node:20-alpine

# 2. Run a container in detached mode with port forwarding and name
docker run -d --name my-web-app -p 8080:3000 node:20-alpine

# 3. List running containers
docker ps

# 4. List ALL containers (including stopped)
docker ps -a

# 5. Inspect container live logs
docker logs -f my-web-app

# 6. Open an interactive shell inside a running container
docker exec -it my-web-app /bin/sh

# 7. Stop and remove a container
docker stop my-web-app
docker rm my-web-app

# 8. View live CPU and Memory usage of all containers
docker stats
```
