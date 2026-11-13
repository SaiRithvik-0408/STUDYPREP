# Day 2: Advanced Two-Pointers, React Fiber, Memory Profiling & Production Dockerfiles

Welcome to Day 2. Today we progress from fundamental syntax to high-level patterns tested in SDE-2 technical rounds: advanced multi-pointer algorithms, React's internal Fiber engine, V8 memory profiling, and production container design.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | Folder | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/`](./dsa/README.md) | 2 Hours | Advanced Two Pointers: 3Sum, Container With Most Water, Trapping Rain Water (All Approaches). |
| **Backend** | [`be/`](./be/README.md) | 1 Hour | Closures, V8 Garbage Collection (Minor GC vs Major GC), Profiling Memory Leaks in Node.js. |
| **Frontend** | [`fe/`](./fe/README.md) | 1 Hour | React Fiber Architecture: Linked List Traversal, Double Buffering, Interruptible Rendering. |
| **Docker** | [`docker/`](./docker/README.md) | 30 Mins | Writing Production Dockerfiles: Layer Caching, Base Images, Security & Non-Root Users. |
| **AI** | [`ai/`](./ai/README.md) | 30 Mins | Prompt Engineering as Code: Few-Shot In-Context Learning, Chain-of-Thought (CoT). |
| **Others** | [`others/`](./others/README.md) | 30 Mins | Day 2 Drills, Memory Leak Debugging Puzzle, Homework Challenge. |

---

## 🎯 Day 2 Mastery Checklist
- [ ] Master the 3Sum pattern ($O(N^2)$) and duplicate skipping logic.
- [ ] Understand the greedy pointer decision in Container With Most Water and Trapping Rain Water ($O(1)$ space).
- [ ] Explain how React Fiber solves the synchronous blocking problem of the Stack Reconciler.
- [ ] Understand V8's Generational Garbage Collector (Young Generation vs Old Generation).
- [ ] Write an optimized, cached Dockerfile that never runs `npm install` on code edits.
- [ ] Implement Chain-of-Thought (CoT) prompt pipelines for complex AI tasks.
