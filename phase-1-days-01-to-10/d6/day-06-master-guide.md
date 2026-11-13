# Day 6: HashMaps & Bucket Sort, Node Streams & Backpressure, TanStack Query & Vector Math

Welcome to Day 6 (Start of Week 2). Today we advance to $O(N)$ Hash Table patterns, master Node.js binary streams to prevent server Out-Of-Memory crashes, configure TanStack Query v5 for server-state caching, examine Linux Docker network drivers, and implement the mathematics of Vector Embeddings and Cosine Similarity from scratch.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | File Path | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/06-hashmaps-and-top-k-elements.md`](./dsa/06-hashmaps-and-top-k-elements.md) | 2 Hours | HashMaps: Group Anagrams, Top K Frequent Elements (Bucket Sort $O(N)$), Longest Consecutive Sequence. |
| **Backend** | [`be/06-nodejs-streams-buffers-backpressure.md`](./be/06-nodejs-streams-buffers-backpressure.md) | 1 Hour | Node.js Streams & Buffers: Memory outside V8 Heap, Backpressure handling with `pipeline`. |
| **Frontend** | [`fe/06-tanstack-query-server-state-caching.md`](./fe/06-tanstack-query-server-state-caching.md) | 1 Hour | Server State Management: TanStack Query v5, StaleTime vs GcTime, Optimistic Updates. |
| **Docker** | [`docker/06-docker-networking-bridge-host.md`](./docker/06-docker-networking-bridge-host.md) | 30 Mins | Container Networking Under the Hood: Bridge, Host, `veth` virtual ethernet pairs, and `iptables`. |
| **AI** | [`ai/06-vector-embeddings-and-cosine-similarity.md`](./ai/06-vector-embeddings-and-cosine-similarity.md) | 30 Mins | Vector Embeddings: High-dimensional geometry, Cosine Similarity math and dot-product calculations. |
| **Others** | [`others/06-streams-and-hashmap-drills.md`](./others/06-streams-and-hashmap-drills.md) | 30 Mins | Day 6 verification quiz, stream memory challenge, and daily homework. |

---

## 🎯 Day 6 Mastery Checklist
- [ ] Master the Bucket Sort pattern to solve Top K Frequent Elements in $O(N)$ linear time.
- [ ] Understand how to check sequence starts in $O(N)$ for Longest Consecutive Sequence.
- [ ] Pipe 5GB files through Node.js using `pipeline` with a constant memory footprint of < 35MB.
- [ ] Architect clean frontend server-state fetching with TanStack Query v5 without unnecessary network re-fetches.
- [ ] Explain how Docker uses Linux `veth` pairs and `iptables` NAT to route traffic into containers.
- [ ] Write a pure TypeScript function calculating Cosine Similarity between two 1536-dimensional vectors.
