# Day 30: System Design (HLD) — Designing Twitter Feed

---

## 1. The Fan-Out Dilemma
* **Fan-Out on Write (Push)**: When a user tweets, push tweet ID into all follower Redis timelines immediately. (Fast read: $O(1)$, but catastrophic for celebrities with 100M followers!).
* **Fan-Out on Read (Pull)**: Generate feed dynamically on request. (High read latency).
* **Hybrid Approach**: Push for normal users (< 25,000 followers); Pull and merge at query time for celebrities!