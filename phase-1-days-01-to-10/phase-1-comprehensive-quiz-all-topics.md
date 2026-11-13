# Phase 1 Comprehensive Milestone Quiz (Days 01 to 10)

This milestone quiz tests your knowledge across all 5 core engineering pillars covered in Days 01 to 10. Every question reflects real senior technical interview questions.

---

## 📚 Pillar 1: Data Structures & Algorithms (DSA)

### Q1.1: Array Memory & Pointer Arithmetic
* **Question**: Why does reading `arr[i]` have a time complexity of $O(1)$ in RAM, while `arr.unshift(val)` takes $O(N)$? Explain the physical memory calculation.
* **Answer**: Arrays occupy contiguous physical memory bytes. Finding any index uses immediate pointer arithmetic: $\text{Address}(i) = \text{Base} + (i \times \text{Size})$. `unshift` places an item at index 0, requiring every existing element to be physically shifted right by one memory slot ($O(N)$).

### Q1.2: Two-Pointer Squeezing Logic
* **Question**: In the "Container With Most Water" problem, why do we always move the pointer pointing to the *shorter* vertical line inward, rather than the taller line?
* **Answer**: The water area is bottlenecked by the shorter line ($\text{Area} = \min(h[L], h[R]) \times (R - L)$). Moving the taller line inward reduces the width while the height remains constrained by the existing shorter line (or worse). Moving the shorter line is the only possibility to encounter a taller line that compensates for the decreased width.

### Q1.3: Sliding Window vs Prefix Sums
* **Question**: In what specific condition does a standard two-pointer sliding window fail for subarray sum problems, requiring Prefix Sums instead?
* **Answer**: When the array contains **negative numbers**. Sliding windows rely on monotonicity (expanding increases sum, shrinking decreases sum). Negative numbers break this assumption, requiring the **Prefix Sum + HashMap** pattern ($O(N)$).

### Q1.4: Floyd's Cycle Detection Proof
* **Question**: In a linked list with a loop, why are `slow` ($1\times$) and `fast` ($2\times$) mathematically guaranteed to collide?
* **Answer**: Inside a loop, the relative distance between them decreases by exactly 1 node per iteration ($2 - 1 = 1$). A gap decreasing by 1 every step cannot jump past 0; they must collide in $\le C$ iterations (where $C$ is the cycle length).

### Q1.5: Virtual 1D Binary Search
* **Question**: How do you map a 1D index `mid` to 2D coordinates `(r, c)` in an $M \times N$ matrix in $O(1)$?
* **Answer**: `row = Math.floor(mid / cols)` and `col = mid % cols`.

---

## 🎨 Pillar 2: Frontend Engineering (React & Next.js)

### Q2.1: Virtual DOM vs Real DOM
* **Question**: What makes direct Real DOM manipulation slow in browsers, and what is the Virtual DOM data structure in memory?
* **Answer**: Real DOM changes trigger browser Layout (Reflow) and Repaint calculations. The Virtual DOM is simply a plain JavaScript object tree in memory; diffing objects in RAM takes milliseconds and avoids triggering browser reflow until the final batch commit.

### Q2.2: React Fiber Architecture
* **Question**: Why did React rewrite its core engine from the Stack Reconciler to React Fiber?
* **Answer**: The Stack Reconciler relied on synchronous JavaScript recursion that could not be paused. If rendering took 80ms, the main thread froze, dropping UI frames. Fiber implements a virtual stack frame using singly-linked lists (`child`, `sibling`, `return`), allowing React to pause, prioritize, and resume rendering without blocking user input.

### Q2.3: The Rules of Hooks Mechanics
* **Question**: Why does calling a hook inside an `if` statement corrupt React's internal state?
* **Answer**: React does not identify hooks by name; it tracks them strictly by invocation order as a singly-linked list (`fiber.memoizedState`). Calling a hook conditionally shifts the pointer alignment, causing subsequent hooks to read the wrong state objects from previous renders.

### Q2.4: React Server Components (RSC)
* **Question**: Why do React Server Components in Next.js 15 ship zero JavaScript bytes to the browser?
* **Answer**: RSCs execute exclusively on the server to query databases and generate a virtual UI tree (RSC payload). Because they never run in the browser and require no client hydration, their component code and dependencies are omitted from the client bundle.

### Q2.5: TanStack Query vs Zustand
* **Question**: What is the architectural difference between Client State and Server State?
* **Answer**: Client State (Zustand) is synchronously owned by the browser (modals, active tabs). Server State (TanStack Query) is asynchronously owned by a remote database; it can become stale at any time, requiring caching, deduplication, background re-fetching, and optimistic updates.

---

## ⚙️ Pillar 3: Backend Engineering (Node.js & Databases)

### Q3.1: V8 Execution Context Lifecycle
* **Question**: What happens during the Creation Phase vs Execution Phase of V8, and what is the Temporal Dead Zone (TDZ)?
* **Answer**: In the Creation Phase, memory is allocated. `var` is set to `undefined`, while `let`/`const` are set to `<uninitialized>` (the TDZ). Accessing variables in the TDZ throws a `ReferenceError` to prevent runtime bugs and ensure `const` immutability.

### Q3.2: Closures in Memory
* **Question**: When an outer function pops off the Call Stack, why don't variables captured in a closure get garbage collected?
* **Answer**: V8 detects that the inner function references an outer variable and promotes that variable out of the ephemeral Call Stack into persistent **Heap Memory** inside a `[[Scopes]]` object.

### Q3.3: Node.js Event Loop Priority Hierarchy
* **Question**: What is the execution order of `process.nextTick`, Promise `.then`, `setTimeout`, and `setImmediate`?
* **Answer**: Synchronous Call Stack $\to$ `process.nextTick` (microtask) $\to$ Promise `.then` (microtask) $\to$ `setTimeout` (Timers macrotask) $\to$ `setImmediate` (Check phase macrotask). Microtasks are drained completely between every phase.

### Q3.4: Backpressure in Streams
* **Question**: What is backpressure, and why is `readable.pipe(writable)` dangerous in production compared to `stream.pipeline()`?
* **Answer**: Backpressure occurs when the data producer reads faster than the consumer can write. `stream.pipe()` does not handle error destruction, leaking file descriptors and memory. `pipeline` automatically manages buffer throttling and destroys all streams on error.

### Q3.5: Dual-Token Authentication Security
* **Question**: Why is storing JWTs in `localStorage` an XSS vulnerability, and how does the Dual-Token pattern solve this?
* **Answer**: Any XSS vulnerability can read `localStorage.getItem('token')` to hijack the session. The dual-token pattern keeps the short-lived access token in memory and stores the refresh token in an `httpOnly`, `secure`, `sameSite=strict` cookie, which client-side JavaScript cannot access.

---

## 🐳 Pillar 4: DevOps, Docker & Infrastructure

### Q4.1: Containers vs Virtual Machines
* **Question**: What are the 3 Linux kernel primitives that make Docker containers possible without a hypervisor?
* **Answer**: (1) **Namespaces** (isolating processes, network, mounts), (2) **Cgroups** (throttling CPU, RAM, disk I/O), and (3) **UnionFS** (layered copy-on-write filesystem).

### Q4.2: Docker Layer Caching
* **Question**: Why must `COPY package*.json ./` and `RUN npm ci` precede `COPY . .` in a Dockerfile?
* **Answer**: Docker caches layers from top to bottom. If package manifests haven't changed, Docker reuses the cached dependencies layer. Copying source code first would invalidate the cache on every code edit, forcing slow re-installations.

### Q4.3: Multi-Stage Builds
* **Question**: How does a multi-stage Dockerfile drop image sizes from 1.2GB down to 130MB?
* **Answer**: It separates the builder stage (containing compilers, TypeScript, linters) from the runner stage. The runner stage copies only compiled JavaScript (`dist/`) and production `node_modules`, omitting devDependencies.

### Q4.4: Docker Compose DNS
* **Question**: How do containers in Docker Compose communicate with each other without hardcoded IP addresses?
* **Answer**: Docker Compose creates a user-defined bridge network with an internal DNS resolver. Containers communicate directly using service names (e.g. `postgres://admin:pass@postgres:5432/db`).

### Q4.5: Nginx Reverse Proxy
* **Question**: Why should Nginx be placed in front of Node.js in production?
* **Answer**: To handle SSL/TLS termination, buffer requests against Slowloris DDoS attacks, compress static assets, and load balance across multiple Node.js container replicas.

---

## 🤖 Pillar 5: Modern AI & Agentic Development

### Q5.1: Token Asymmetry
* **Question**: Why are LLM output tokens significantly more expensive and slower to generate than input tokens?
* **Answer**: Input tokens are processed in parallel across GPU matrix cores in a single pass. Output tokens are generated **auto-regressively** (one token at a time), where each generated token is fed back into the context to predict the next token.

### Q5.2: Chain-of-Thought (CoT) Prompting
* **Question**: Why does forcing an LLM to generate internal reasoning steps before outputting JSON drastically improve accuracy?
* **Answer**: Generated reasoning tokens become part of the context window. The model's self-attention heads attend to these intermediate calculations when generating the final answer.

### Q5.3: Self-Healing Schema Loops
* **Question**: How does a Self-Healing AI loop handle malformed JSON output?
* **Answer**: It parses the output with a Zod schema. If validation fails, it extracts the exact Zod error issues and feeds them back to the model as an error-correction prompt, achieving $\approx 99.9\%$ runtime reliability.

### Q5.4: Function Calling Mechanics
* **Question**: Does an LLM execute backend code directly during Function Calling?
* **Answer**: No. The LLM only outputs structured JSON containing the tool name and arguments. Your backend parses the arguments, executes the real function locally, and feeds the output back into the conversation context.

### Q5.5: Vector Embeddings & Cosine Similarity
* **Question**: Why is Cosine Similarity preferred over Euclidean Distance (L2 norm) for comparing text embeddings?
* **Answer**: Cosine similarity measures the angle between vectors rather than their absolute magnitude. Documents with identical semantic meaning receive high similarity scores even if one document is significantly longer than the other.
