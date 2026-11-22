# Day 3: Sliding Window (Fixed), React Hooks Internals, Event Loop & Multi-Stage Docker

Welcome to Day 3. Today we unlock sliding window algorithmic patterns, look inside React's hook linked list, dissect Libuv's thread pool and Event Loop phases, and write production multi-stage Docker builds.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | Folder | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/`](./dsa/03-sliding-window-fixed-and-anagrams.md) | 2 Hours | Fixed-Size Sliding Window: Max Average Subarray, Permutation in String (Anagrams). |
| **Backend** | [`be/`](./be/03-event-loop-libuv-and-threadpool.md) | 1 Hour | The Event Loop & Libuv: Microtasks vs Macrotasks, `process.nextTick`, Thread Pool. |
| **Frontend** | [`fe/`](./fe/03-react-hooks-internals-and-custom-hooks.md) | 1 Hour | React Hooks Internals: How `useState` & `useEffect` work in Fiber's `memoizedState` linked list. |
| **Docker** | [`docker/`](./docker/03-multi-stage-docker-builds.md) | 30 Mins | Multi-Stage Docker Builds: Reducing 1.2GB image to 130MB, Healthchecks. |
| **AI** | [`ai/`](./ai/03-zod-schema-validation-and-retry-loops.md) | 30 Mins | Self-Healing AI Pipelines: Schema validation with Zod and automated retry loops. |
| **Others** | [`others/`](./others/03-event-loop-drills-and-quizzes.md) | 30 Mins | Day 3 Quizzes, Event Loop Tracing Drill, Homework. |

---

## 🎯 Day 3 Mastery Checklist
- [ ] Understand the fixed-size sliding window pattern: add incoming, remove outgoing in $O(1)$.
- [ ] Master anagram frequency matching in strings using a sliding window.
- [ ] Explain why React Hooks cannot be placed inside `if` statements or loops (Hook Linked List).
- [ ] Memorize the exact priority order of `process.nextTick`, Promises, `setTimeout`, and `setImmediate`.
- [ ] Write a production multi-stage `Dockerfile` with separate build and runner stages.
- [ ] Build a self-healing LLM client that retries on malformed JSON.
