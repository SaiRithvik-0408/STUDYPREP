# Day 15: Drills, Quizzes & Practical Exercises

1. **DSA**: What is the difference in space complexity between sorting an array $O(N \log N)$ vs Min-Heap $O(K)$ for the Kth largest problem?
   * *Answer*: Min-Heap only keeps $K$ items in memory ($O(K)$), which is essential when streaming infinite data or large arrays where $K \ll N$.
2. **Backend**: Why is executing a Lua script in Redis guaranteed to be atomic?
   * *Answer*: Redis runs on a single execution thread; while a Lua script executes, no other Redis command or script can run until it completes.