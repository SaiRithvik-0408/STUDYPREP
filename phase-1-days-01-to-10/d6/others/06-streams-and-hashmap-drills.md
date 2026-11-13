# Day 6: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 6 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In the "Top K Frequent Elements" problem, how does the Bucket Sort approach achieve $O(N)$ linear time compared to the Min-Heap's $O(N \log K)$?
   * *Answer*: Because an element in an array of size $N$ can appear at most $N$ times, we can allocate an array of buckets of size $N + 1$ where the array index directly represents frequency. Inserting elements into buckets takes $O(N)$, and scanning buckets from index $N$ down to 1 takes $O(N)$, completely avoiding any logarithmic comparisons.
2. **Backend**: What is backpressure in Node.js streams, and what happens if you ignore it when streaming data to a slow client?
   * *Answer*: Backpressure occurs when the data producer reads faster than the consumer can write. If ignored, the unwritten chunks accumulate in Node.js memory queues, causing RAM usage to balloon until the process crashes with an out-of-memory error (`JavaScript heap out of memory`).
3. **Frontend**: In TanStack Query v5, what is the difference between `staleTime` and `gcTime`?
   * *Answer*: `staleTime` defines how long fetched data is considered fresh before triggering a background refetch. `gcTime` defines how long inactive/unused cached data remains stored in memory after all subscribing components unmount before it is garbage collected.
4. **DevOps**: What is the function of a Linux `veth` pair in a Docker bridge network?
   * *Answer*: A `veth` (virtual ethernet) pair acts like a virtual network cable: one end attaches to the container's private `eth0` network namespace, while the other end attaches to the host's `docker0` bridge virtual switch, enabling packets to traverse between the container and host.
5. **AI**: Why is Cosine Similarity preferred over Euclidean Distance (L2 norm) when comparing vector embeddings of text?
   * *Answer*: Cosine similarity measures the angle between vectors rather than their absolute physical length. This ensures that two documents with identical semantic meaning are scored as similar even if one document is twice as long as the other (which would create a large Euclidean distance due to magnitude scaling).

---

## 💻 Part 2: Hands-On Homework Challenge

1. Implement `groupAnagrams` in TypeScript using the 26-element count key approach. Verify that words like `"bdddddddddd"` and `"bbbbbbbbbbc"` produce distinct, collision-free hash keys!
2. Create a test script using `stream.pipeline` that reads a text file, pipes it through `zlib.createGzip()`, and writes out a compressed `.gz` file. Confirm that error handling triggers cleanly if the source file path is invalid.
