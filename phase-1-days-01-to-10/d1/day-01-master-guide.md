# Day 1: Foundations from Scratch

Welcome to Day 1 of your accelerated training. Today we build unshakeable fundamentals from the ground up—stripping away all assumptions and learning how hardware, engines, containers, and AI models actually work.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | Folder | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/`](./dsa/README.md) | 1.5 - 2 Hours | Arrays in RAM, Pointer Arithmetic, Two-Pointer Pattern, 3 LeetCode Problems (All Approaches). |
| **Backend** | [`be/`](./be/README.md) | 1 Hour | The V8 Engine, Execution Context Lifecycle, Hoisting, Temporal Dead Zone (TDZ). |
| **Frontend** | [`fe/`](./fe/README.md) | 1 Hour | Browser DOM vs Virtual DOM, Component Lifecycle, JSX compilation, React 18/19 render cycle. |
| **Docker** | [`docker/`](./docker/README.md) | 30 Mins | Containers vs Virtual Machines, Linux Namespaces & Cgroups, Docker Engine Architecture. |
| **AI** | [`ai/`](./ai/README.md) | 30 Mins | LLM Primitives, Byte-Pair Encoding (Tokens), Temperature, Strict Structured JSON Outputs. |
| **Others** | [`others/`](./others/README.md) | 30 Mins | Day 1 Verification Quiz, Event Loop Output Puzzle, Hands-on Coding Drill. |

---

## 🎯 Day 1 Mastery Checklist
- [ ] Understand why array lookups `arr[i]` are $O(1)$ and `arr.unshift()` is $O(N)$.
- [ ] Master the Two-Pointer technique and solve:
  - Two Sum II (Sorted)
  - Remove Duplicates from Sorted Array
  - Move Zeroes
- [ ] Explain how V8 allocates memory during the **Creation Phase** vs **Execution Phase**.
- [ ] Explain why accessing `let`/`const` before declaration causes a `ReferenceError` (TDZ).
- [ ] Explain why Docker containers boot in milliseconds while VMs take minutes.
- [ ] Write a Node.js script that forces an LLM to reply with strictly typed JSON.
- [ ] Complete the quiz and exercises in `others/`.
