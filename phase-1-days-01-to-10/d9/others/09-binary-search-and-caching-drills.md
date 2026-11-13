# Day 9: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 9 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In the "Search in Rotated Sorted Array" problem, how do we determine whether the target element could be in the left half or right half of the search space in $O(\log N)$ time?
   * *Answer*: By checking if `nums[low] <= nums[mid]`. If true, the left half is strictly sorted; we then check if `target` lies within `[nums[low], nums[mid]]`. If false, the right half must be strictly sorted; we check if `target` lies within `[nums[mid], nums[high]]`. This allows us to discard half of the array on every step.
2. **Backend**: What is a "Cache Stampede" (Dogpiling), and how does a distributed mutex lock in Redis solve it?
   * *Answer*: A cache stampede occurs when a high-traffic cache key expires, causing thousands of concurrent requests to miss the cache and overwhelm the primary database simultaneously. A distributed mutex (`SET lock:key "locked" NX PX 5000`) permits only one single worker process to query the database and repopulate the cache, while all other requests wait briefly or receive stale data.
3. **Frontend**: What is the purpose of `useOptimistic` in Next.js 15, and how does it improve perceived performance?
   * *Answer*: `useOptimistic` allows components to immediately render the expected result of a mutation before the server responds across the network. If the Server Action succeeds, the UI seamlessly transitions to the real server data; if it fails, `useOptimistic` automatically rolls back to the previous state.
4. **DevOps**: Why should Nginx be placed in front of Node.js to mitigate Slowloris DDoS attacks?
   * *Answer*: Slowloris attacks hold HTTP connections open by sending header bytes extremely slowly. Node.js's single-threaded event loop exhausts its concurrent socket limit quickly. Nginx uses an asynchronous worker architecture that can buffer tens of thousands of incomplete connections without passing them to Node.js until the entire request header has arrived.
5. **AI**: Why are Server-Sent Events (SSE) generally preferred over WebSockets for streaming LLM text completions to a web browser?
   * *Answer*: LLM token generation is strictly unidirectional (server $\to$ client). SSE operates over standard HTTP/1.1 or HTTP/2 without requiring custom WebSocket handshake protocols, supports native browser automatic reconnection, works seamlessly through firewalls and corporate proxies, and leverages standard HTTP response streaming.

---

## 💻 Part 2: Hands-On Homework Challenge

1. Implement `searchRotated` (LeetCode 33) in TypeScript without looking at references. Test it against edge cases:
   * Array: `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0` (Expected: index `4`).
   * Array: `nums = [1]`, `target = 0` (Expected: `-1`).
2. Implement a simple Redis sliding window rate limiter function that limits an IP address to 5 requests per 10 seconds.
