# Phase 4 Comprehensive Milestone Quiz (Days 31 to 40)

This final milestone quiz evaluates your overall readiness for SDE-1 / SDE-2 Full-Stack & AI Engineer interviews.

---

## 📚 Pillar 1: Data Structures & Algorithms (DSA)
1. **Consistent Hashing**: How does consistent hashing prevent massive cache invalidation when scaling servers?
   * *Answer*: By placing both servers and keys on a virtual 360-degree ring. When a server node is added or removed, only $K / N$ keys need to be reassigned to adjacent nodes, rather than re-hashing all keys.
2. **LRU Cache**: Why is a Doubly-Linked List combined with a Hash Map to implement an LRU cache?
   * *Answer*: The Hash Map provides $O(1)$ key lookup. The Doubly-Linked List allows $O(1)$ removal and insertion of nodes at the head (most recently used) and tail (least recently used) without shifting array elements.
3. **Intervals**: In Merge Intervals, why must we sort intervals by their start time first?
   * *Answer*: Sorting ensures that any intervals that could potentially overlap are placed immediately adjacent to each other in sequence.
4. **Trie**: What is the time complexity of searching a word of length $L$ in a Trie containing $N$ total words?
   * *Answer*: $O(L)$ constant with respect to total dictionary size $N$; it depends solely on the number of characters in the target search word.
5. **Live Coding**: What is the most critical first step before writing a single line of code in an interview?
   * *Answer*: Clarifying input constraints, asking about edge cases (null inputs, duplicates, empty arrays), and explaining the proposed approach and time/space complexity before typing.

---

## 🎨 Pillar 2: Frontend Engineering & Architecture
1. **Row-Level Security (RLS)**: Why is RLS in PostgreSQL more reliable than filtering by `tenantId` in Node.js backend code?
   * *Answer*: Application code can forget a `where: { tenantId }` clause due to developer error. RLS enforces isolation directly at the database engine level, making cross-tenant data leakage impossible regardless of application bugs.
2. **Multi-Tenancy Routing**: How do SaaS platforms handle subdomain tenant routing in Next.js?
   * *Answer*: Using Next.js Middleware to rewrite incoming requests based on the `Host` header (e.g. `tenant1.myapp.com` rewrites to `/app/tenant1/`).
3. **E2E Testing**: What makes Playwright superior to traditional Cypress or Selenium for modern full-stack testing?
   * *Answer*: Playwright runs multi-browser contexts in parallel, auto-waits for DOM elements without flaky arbitrary `sleep()` timers, and supports testing multi-tab and multi-user interactions natively.
4. **Monaco Editor**: How do you render an interactive code editor in React without slowing down page load?
   * *Answer*: By lazy-loading the Monaco Editor chunk asynchronously using dynamic imports (`next/dynamic` with `ssr: false`).
5. **Core Web Vitals**: What causes poor Cumulative Layout Shift (CLS), and how do you prevent it?
   * *Answer*: Images or ads loading without explicit width/height dimensions, causing content to jump unexpectedly. Prevent by always specifying aspect ratios or reserved skeleton containers.

---

## ⚙️ Pillar 3: Backend Engineering & System Design
1. **Stripe Webhook Idempotency**: Why must payment webhooks be idempotent?
   * *Answer*: Network retries from payment processors can deliver the same webhook multiple times. Storing processed Stripe event IDs prevents charging users twice or provisioning duplicate subscriptions.
2. **Rate Limiting with Sliding Windows**: How does a Redis Sorted Set implement a true sliding window rate limiter?
   * *Answer*: It records request timestamps as `ZSET` scores, purges timestamps older than $(now - window)$, and counts remaining elements in the set atomically.
3. **AST Code Chunking**: Why is parsing code into an Abstract Syntax Tree (AST) superior to line-based chunking for code search?
   * *Answer*: Line-based chunking slices functions in half. AST chunking extracts complete, syntactically valid functions, classes, and interfaces as discrete semantic units.
4. **Audit Logging**: What information must be captured in an immutable enterprise audit log?
   * *Answer*: Who (userId), What (action/mutation), When (ISO timestamp), Where (IP & user-agent), and the Before/After state delta.
5. **System Design Communication**: How do you begin a 45-minute High-Level Design (HLD) interview?
   * *Answer*: Establish functional and non-functional requirements (scale, latency, availability), perform back-of-the-envelope capacity estimations (QPS, storage), and draw the high-level data flow before diving into database schemas.

---

## 🐳 Pillar 4: DevOps & Infrastructure
1. **Staging vs Production**: How do you prevent environment drift between local Docker Compose and production?
   * *Answer*: By using a single immutable base `docker-compose.yml` and applying environment-specific overrides (`docker-compose.override.yml` for dev, `docker-compose.prod.yml` for prod).
2. **Docker in Docker (DinD)**: What is the main security risk of DinD, and how do you mitigate it?
   * *Answer*: DinD requires running containers in `--privileged` mode, granting root access to host devices. Mitigation: Use unprivileged rootless sandboxes like gVisor or Firecracker microVMs.
3. **Horizontal Scaling**: What is the command to scale an Express background worker to 5 container replicas in Docker Compose?
   * *Answer*: `docker compose up -d --scale worker=5`.
4. **Log Management**: What happens if a production container does not configure log rotation?
   * *Answer*: JSON log files will grow indefinitely until they consume 100% of the disk volume, causing the Docker daemon and operating system to crash.
5. **Zero-Trust Networking**: How do microservices communicate securely inside a container cluster?
   * *Answer*: Using Mutual TLS (mTLS), where both client and server authenticate each other via cryptographic certificates managed by a service mesh (Linkerd / Istio).

---

## 🤖 Pillar 5: Modern AI & Career Strategy
1. **Langfuse Tracing**: What telemetry data does an LLM observability platform track?
   * *Answer*: Full prompt/completion token counts, step-by-step latency, tool call execution outputs, monetary cost per request, and user feedback ratings.
2. **PII Masking**: Why must PII (Personally Identifiable Information) be redacted before calling third-party LLMs?
   * *Answer*: To comply with GDPR, HIPAA, and SOC2 regulations and prevent sensitive user data (credit cards, SSNs, passwords) from entering model inference logs.
3. **Resume XYZ Formula**: How should software achievements be formatted on a resume?
   * *Answer*: *"Accomplished [X] as measured by [Y] by doing [Z]"* (e.g. *"Accelerated semantic document search by 84% (p99 latency from 1.2s to 190ms) by implementing HNSW vector indexing in pgvector."*).
4. **Behavioral STAR Method**: How long should a candidate spend describing the "Situation" vs the "Action"?
   * *Answer*: Spend only ~20% of your time on Situation/Task, and dedicate 70% of your time to the specific technical Actions YOU took and the quantifiable Results.
5. **Salary Negotiation**: When is the optimal moment to discuss compensation during a job switch?
   * *Answer*: After you have passed all technical rounds and an offer is made. Never disclose your previous salary or give a rigid number early in the process.
