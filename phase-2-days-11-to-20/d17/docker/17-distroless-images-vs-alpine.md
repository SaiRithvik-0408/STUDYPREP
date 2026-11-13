# Day 17: DevOps & Google Distroless Images

* **Alpine Linux**: Minimal (~5MB), but contains shell (`/bin/sh`), package manager (`apk`), and system binaries.
* **Google Distroless (`gcr.io/distroless/nodejs20-debian12`)**: Contains **ONLY** the Node.js runtime and its dependencies. Zero package managers, zero shells! Attackers cannot run bash scripts inside your container.