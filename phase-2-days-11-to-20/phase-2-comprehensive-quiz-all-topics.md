# Phase 2 Comprehensive Milestone Quiz (Days 11 to 20)

This milestone quiz tests your knowledge across all 5 core engineering pillars covered in Days 11 to 20.

---

## 📚 Pillar 1: Data Structures & Algorithms (DSA)
1. **Linked Lists**: Why does reversing a linked list in-place require three pointer variables (`prev`, `curr`, `tempNext`)?
   * *Answer*: Because updating `curr.next = prev` severs the link to the rest of the list. `tempNext` preserves the rest of the list in memory.
2. **Stacks**: How does the MinStack class achieve $O(1)$ `getMin()` retrieval without scanning elements?
   * *Answer*: By maintaining a synchronized auxiliary stack (`minStack`) that records the minimum value present at each stack depth.
3. **Monotonic Stacks**: Why does the Daily Temperatures problem run in $O(N)$ linear time despite having a nested while-loop?
   * *Answer*: Each element is pushed onto the stack exactly once and popped at most once ($2N$ operations total across the entire array).
4. **Binary Search on Answer**: In Koko Eating Bananas, why does the problem satisfy the monotonic predicate required for binary search?
   * *Answer*: If Koko can finish all bananas at speed $K$, she can also finish at any speed $> K$.
5. **Trees**: In validating a Binary Search Tree (BST), why is checking `node.left.val < node.val` insufficient?
   * *Answer*: A node in the left subtree could have a value greater than an ancestor root node further up. Minimum and maximum boundaries must be passed down recursively.

---

## 🎨 Pillar 2: Frontend Engineering
1. **List Virtualization**: How does TanStack Virtual allow rendering 50,000 items in React at 60fps?
   * *Answer*: It only renders the items currently visible inside the viewport plus a small overscan buffer (e.g. 15 DOM nodes), dynamically updating their transform offsets as the user scrolls.
2. **Error Boundaries**: Why can't functional components with `try/catch` replace React Error Boundaries?
   * *Answer*: `try/catch` only catches errors inside imperative event handlers, not errors thrown during React's declarative render phase.
3. **React 19 Actions**: What is the purpose of `useActionState`?
   * *Answer*: It manages the lifecycle, return values, and pending transitions of asynchronous server actions during form submissions.
4. **Web Workers**: When should you offload tasks to a Web Worker?
   * *Answer*: When performing heavy CPU computations (image processing, crypto, large dataset sorting) that would otherwise block the main browser thread.
5. **WebSockets**: How do you prevent stale WebSocket connections from dropping in production?
   * *Answer*: By implementing periodic Heartbeat Pings (e.g. every 30s) and an automated exponential backoff reconnection loop.

---

## ⚙️ Pillar 3: Backend Engineering & Databases
1. **PostgreSQL Indexing**: What is the difference between an Index Scan and an Index-Only Scan?
   * *Answer*: An Index Scan reads from the B-tree index and then fetches table data from the disk heap. An Index-Only Scan satisfies the query directly from the index leaves without touching heap storage.
2. **ACID Transactions**: What is the danger of the "Read Committed" isolation level?
   * *Answer*: Non-repeatable reads. If transaction A reads a row, and transaction B updates and commits that row, transaction A re-reading the row will see the new value.
3. **Redis Lua Scripts**: Why use Lua scripts in Redis instead of sequential API calls?
   * *Answer*: Redis executes Lua scripts atomically in a single clock cycle without context switches or race conditions.
4. **MongoDB ESR Rule**: What does ESR stand for, and why does order matter?
   * *Answer*: Equality $\to$ Sort $\to$ Range. Placing Sort before Range allows MongoDB to use the index for ordering without an in-memory sort.
5. **Zero-Downtime Migrations**: What is the Expand/Contract migration pattern?
   * *Answer*: Adding the new column (Expand), dual-writing to both columns, backfilling historical data, and dropping the old column (Contract).

---

## 🐳 Pillar 4: DevOps & Infrastructure
1. **Docker Secrets**: Why are Docker secrets safer than environment variables?
   * *Answer*: Environment variables leak into `docker inspect` logs and error dumps. Secrets are mounted as temporary in-memory files at `/run/secrets/`.
2. **Resource Constraints**: What happens when a container exceeds its `deploy.resources.limits.memory`?
   * *Answer*: The Linux kernel triggers the OOM-Killer and kills the container process with exit code 137.
3. **Container Auditing**: What tools are used to audit container vulnerabilities?
   * *Answer*: Hadolint (Dockerfile linting) and Trivy (scanning base images for CVE vulnerabilities).
4. **Distroless Images**: What is a Google Distroless container image?
   * *Answer*: A container image containing strictly the application runtime (Node.js) with zero shells, package managers, or OS binaries.
5. **Multi-Architecture**: How does Docker Buildx compile images for both Apple Silicon (ARM64) and AWS (AMD64)?
   * *Answer*: Using QEMU CPU emulation with `--platform linux/amd64,linux/arm64`.

---

## 🤖 Pillar 5: Modern AI & Vector Systems
1. **Vector Indexing**: How does an HNSW index achieve logarithmic search speed over millions of vectors?
   * *Answer*: By organizing vectors into a multi-layer skip-list graph, traversing coarse long-distance links at the top layer and fine nearest neighbors at the bottom.
2. **pgvector**: What is the difference between `<->` and `<=>` operators in pgvector?
   * *Answer*: `<->` calculates Euclidean Distance (L2 norm), while `<=>` calculates Cosine Distance.
3. **Hybrid Search**: Why combine BM25 keyword search with dense vector search?
   * *Answer*: Dense vectors understand concepts but struggle with exact alphanumeric strings (part numbers, acronyms). BM25 catches exact keyword matches.
4. **Re-ranking**: Why use a Cross-Encoder to re-rank vector search results?
   * *Answer*: Cross-encoders process query and text jointly through full attention layers, eliminating false-positive semantic matches.
5. **RAGAS Metrics**: What are the 3 core metrics for evaluating RAG pipelines?
   * *Answer*: Faithfulness (grounded in context), Answer Relevance (answers user query), and Context Recall (retrieved all necessary facts).
