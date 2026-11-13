# Day 10: Phase 1 Comprehensive Technical Audit (20-Point Interview Evaluation)

Congratulations on completing the first 10 days of intensive training. This audit tests whether you possess the deep first-principles knowledge required to pass senior engineering interviews.

---

## 🎯 The 20-Point Technical Audit

### [DSA Section]
1. **Why is `arr.unshift()` in JavaScript an $O(N)$ operation while `arr[i]` is $O(1)$?**
   * *Answer*: Arrays occupy contiguous memory addresses. Index access uses immediate pointer arithmetic $O(1)$. Unshifting inserts at index 0, requiring the CPU to physically shift all $N$ subsequent elements one memory address to the right ($O(N)$).
2. **In the 3Sum problem, why must the array be sorted first, and how do we prevent duplicate triplets?**
   * *Answer*: Sorting ($O(N \log N)$) allows Converging Two Pointers to find pairs in $O(N)$ rather than $O(N^2)$. Duplicates are avoided by skipping adjacent identical numbers for the outer fixed pointer (`nums[i] === nums[i - 1]`) and for both inner pointers after finding a match.
3. **Why does a standard Sliding Window fail when an array contains negative numbers? What must be used instead?**
   * *Answer*: Sliding windows require monotonicity (expanding increases sum, shrinking decreases sum). Negative numbers destroy monotonicity. You must use the **Prefix Sum + Frequency HashMap** pattern instead.
4. **In Floyd's Cycle Detection algorithm, why are `slow` (1 step) and `fast` (2 steps) guaranteed to meet inside a cycle?**
   * *Answer*: Once both enter the cycle, the relative distance between them shrinks by exactly 1 node per iteration ($2 - 1 = 1$). It is mathematically impossible for the fast pointer to hop over the slow pointer; they must collide in $\le C$ iterations (where $C$ is cycle length).
5. **How can an $M \times N$ matrix with sorted rows and columns be binary searched in a single $O(\log(M \cdot N))$ pass?**
   * *Answer*: By treating the matrix as a virtual 1D array of length $M \cdot N$. For any 1D midpoint `mid`, its 2D coordinates are mapped in $O(1)$ using `row = Math.floor(mid / cols)` and `col = mid % cols`.

---

### [JavaScript & Backend Section]
6. **What is the Temporal Dead Zone (TDZ), and why does accessing `let` before initialization throw an error while `var` returns `undefined`?**
   * *Answer*: Both are hoisted in memory during the Creation Phase. However, `var` is initialized to `undefined`, while `let` and `const` remain `<uninitialized>`. Accessing an uninitialized variable throws a `ReferenceError` to catch runtime bugs and preserve `const` immutability.
7. **When an outer function finishes running and its stack frame is popped, why doesn't a closure get garbage collected?**
   * *Answer*: V8 analyzes lexical scopes at compile time. When an inner function references an outer variable, V8 moves that variable out of the Call Stack and allocates it in **Heap Memory** inside a persistent `[[Scopes]]` object.
8. **What is the exact execution priority between `process.nextTick`, Promises, `setTimeout`, and `setImmediate`?**
   * *Answer*: Synchronous Call Stack $\to$ `process.nextTick` (highest microtask) $\to$ Promise `.then` (microtask) $\to$ `setTimeout` (Timers macrotask) $\to$ `setImmediate` (Check phase macrotask). All microtasks are drained between every single phase and callback.
9. **Which operations in Node.js utilize the Libuv Thread Pool, and which do NOT?**
   * *Answer*: Used by: File I/O (`fs`), crypto (`crypto.pbkdf2`), compression (`zlib`), and DNS lookups (`dns.lookup`). NOT used by: Network sockets and HTTP requests (which use OS kernel non-blocking mechanisms like Linux `epoll`).
10. **Why are Buffers in Node.js allocated outside the V8 Heap?**
    * *Answer*: Buffers represent raw binary memory allocated via C++ `malloc()`. Storing them outside the V8 Heap prevents them from counting toward V8's `--max-old-space-size` memory limits and avoids garbage collection pauses during high-throughput I/O.

---

### [Frontend & React Section]
11. **Why does using array index as a `key` (`key={index}`) in React lists cause severe visual and state corruption bugs?**
    * *Answer*: React uses keys to match virtual DOM nodes between renders. If an item is deleted or reordered, its index changes. React reuses old DOM nodes based on matching index keys, incorrectly attaching previous local component state (input text, checkboxes) to the wrong data rows.
12. **Why does React Fiber use a singly-linked list (`child`, `sibling`, `return`) instead of a tree of child arrays?**
    * *Answer*: Singly-linked lists allow React to traverse the tree iteratively rather than recursively. React can pause rendering at any node, save its pointer, yield control back to the browser to handle user input, and resume later without dropping frames.
13. **Why does React Fiber maintain two trees simultaneously (Double Buffering)?**
    * *Answer*: To prevent visual tearing or incomplete UI updates. The Work-in-Progress (WIP) tree is built off-screen in memory. Once reconciliation finishes, React swaps the root pointer in one synchronous commit, updating the real DOM instantly.
14. **Why do React Server Components (RSC) in Next.js 15 ship zero bytes of JavaScript to the browser?**
    * *Answer*: Server Components execute exclusively on the server to query databases and generate virtual UI trees (RSC Payload). Because they never execute in the browser and require no client-side hydration, their code and dependencies are completely omitted from the client bundle.
15. **What is the difference between `staleTime` and `gcTime` in TanStack Query v5?**
    * *Answer*: `staleTime` determines how long data remains fresh before background re-fetching is triggered. `gcTime` determines how long unused cached data remains stored in memory after all subscribing components unmount before it is garbage collected.

---

### [DevOps & Docker Section]
16. **What is the fundamental difference between a Docker Container and a Virtual Machine?**
    * *Answer*: VMs virtualize hardware and run an entire, heavy guest operating system. Docker containers virtualize the operating system, sharing the host Linux kernel while running as isolated processes via kernel Namespaces (isolation) and Cgroups (resource limits).
17. **Why must dependency manifests (`package*.json`) be copied before copying application source code in a Dockerfile?**
    * *Answer*: To maximize Docker's layer cache. If `package.json` has not changed, Docker reuses the cached `npm ci` layer. If source code was copied first, every single code edit would invalidate the cache and force `npm ci` to re-install all packages from scratch.
18. **Why should Node.js containers never run as the `root` user (`UID 0`)?**
    * *Answer*: If an attacker executes arbitrary code through a vulnerability in an npm package or web application, they will have root privileges inside the container, increasing the risk of escaping the container to gain full root access to the host server.
19. **Why should Nginx be placed in front of Node.js in production rather than exposing Node directly on port 80/443?**
    * *Answer*: Nginx handles SSL/TLS termination, request buffering (defending against Slowloris DDoS attacks), static asset caching, and load balancing, freeing Node.js to dedicate 100% of its single-threaded event loop to application logic.

---

### [Modern AI & Agentic Section]
20. **Why are LLM output tokens significantly more expensive and slower to generate than input tokens?**
    * *Answer*: Input tokens are processed in parallel across GPU matrix cores in a single pass. Output tokens must be generated **auto-regressively** (one token at a time), where each newly predicted token is appended to the context window and fed back through the model to predict the next token.

---

## 🏆 Scoring Guide:
* **18 - 20 Correct**: **Senior SDE-2 Tier**. Exceptional first-principles grasp across the entire stack.
* **15 - 17 Correct**: **Solid SDE-1 / Mid-Level Tier**. Ready for product company interviews; review missed areas.
* **< 15 Correct**: Review the corresponding Day documents in `d1/` through `d9/`.
