# Day 7: Prefix Sums, Clean 3-Tier Architecture, Headless UI & Vector Search

Welcome to Day 7. Today we master Prefix Sum patterns to solve subarray range problems in $O(N)$, structure production backend services using the **Controller-Service-Repository pattern**, build accessible headless UI components with Tailwind and Radix primitives, harden PostgreSQL Docker containers, and build an in-memory vector search engine from scratch.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | File Path | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/07-prefix-sum-and-subarray-equals-k.md`](./dsa/07-prefix-sum-and-subarray-equals-k.md) | 2 Hours | Prefix Sums + HashMaps: Subarray Sum Equals K, Continuous Subarray Sum (Modulo arithmetic). |
| **Backend** | [`be/07-clean-architecture-controller-service-repo.md`](./be/07-clean-architecture-controller-service-repo.md) | 1 Hour | Clean Architecture: 3-Tier Pattern (Controller $\to$ Service $\to$ Repository) & Dependency Injection. |
| **Frontend** | [`fe/07-tailwind-and-radix-accessible-design.md`](./fe/07-tailwind-and-radix-accessible-design.md) | 1 Hour | Headless UI Architecture: Tailwind CSS, Radix UI primitives, Focus Traps, and WAI-ARIA standards. |
| **Docker** | [`docker/07-dockerizing-postgresql-with-healthchecks.md`](./docker/07-dockerizing-postgresql-with-healthchecks.md) | 30 Mins | Production Database Containerization: Initialization scripts, tuning `shm_size`, and healthchecks. |
| **AI** | [`ai/07-in-memory-vector-search-engine.md`](./ai/07-in-memory-vector-search-engine.md) | 30 Mins | Semantic Search Engine: Building an in-memory Vector Database and Top-$K$ retrieval pipeline. |
| **Others** | [`others/07-clean-architecture-and-prefix-drills.md`](./others/07-clean-architecture-and-prefix-drills.md) | 30 Mins | Day 7 verification quiz, prefix sum drills, and code review exercises. |

---

## 🎯 Day 7 Mastery Checklist
- [ ] Understand why Prefix Sums allow range sum queries in $O(1)$ constant time.
- [ ] Solve Subarray Sum Equals K in $O(N)$ using a running prefix sum map.
- [ ] Implement Clean Architecture in Node.js, completely isolating database logic from HTTP controllers.
- [ ] Build an accessible modal dialog with focus traps adhering to WAI-ARIA standards.
- [ ] Configure PostgreSQL in Docker with automated SQL migration scripts in `/docker-entrypoint-initdb.d/`.
- [ ] Build a runnable in-memory Vector Search engine that returns top-$K$ matching documents.
