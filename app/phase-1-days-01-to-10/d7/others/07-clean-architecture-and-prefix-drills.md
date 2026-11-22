# Day 7: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 7 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In the "Subarray Sum Equals K" problem, why can't we use a standard Two-Pointer Sliding Window if the array contains negative numbers?
   * *Answer*: Sliding windows require monotonicity (expanding `right` increases the sum, shrinking `left` decreases the sum). If the array contains negative numbers, expanding the window can cause the sum to decrease, completely breaking the sliding window's mathematical assumptions. Prefix Sum with a frequency HashMap is required.
2. **Backend**: Why is mixing database queries directly inside an Express route handler considered an architectural anti-pattern?
   * *Answer*: It violates the Single Responsibility Principle and couples the transport layer (HTTP) directly with data persistence. This prevents you from unit testing business logic in isolation without running a real database and makes it difficult to change database drivers without rewriting API endpoints.
3. **Frontend**: What is a "Focus Trap" in an accessible modal dialog, and why is it necessary?
   * *Answer*: A focus trap intercepts keyboard `Tab` events and ensures the user's cursor only cycles through focusable elements inside the active dialog box. Without it, visually impaired keyboard users will tab out of the modal into background page elements they cannot see.
4. **DevOps**: Why can PostgreSQL crash with an out-of-memory error inside a Docker container when running complex analytical queries even if the host machine has 64GB of RAM?
   * *Answer*: Docker defaults the POSIX shared memory (`/dev/shm`) limit to only 64MB for any container. PostgreSQL uses shared memory for parallel query workers and large hash joins. If a query requires more than 64MB of shared memory, it crashes with `No space left on device` unless configured with `shm_size: 256mb`.
5. **AI**: What is the computational time complexity of retrieving the Top-$K$ documents from an unindexed in-memory vector store containing $N$ documents of dimension $D$?
   * *Answer*: $O(N \cdot D)$ to compute the Cosine Similarity dot product against all $N$ vectors, plus $O(N \log K)$ to maintain the top-$K$ items using a Min-Heap (or $O(N \log N)$ with a full array sort).

---

## 💻 Part 2: Hands-On Homework Challenge

1. Implement `subarraySum` (LeetCode 560) in TypeScript. Verify that it correctly handles negative arrays like `nums = [1, -1, 0]`, `k = 0` (Expected output: 3 subarrays: `[1, -1]`, `[0]`, and `[1, -1, 0]`).
2. Refactor any existing endpoint in your portfolio project to strictly follow the 3-Tier Pattern: separate the Controller, the Business Service, and the Database Repository.
