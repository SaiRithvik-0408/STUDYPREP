# Day 12: Drills, Quizzes & Practical Exercises

1. **DSA**: How does the MinStack class achieve $O(1)$ `getMin()` operations without scanning elements?
   * *Answer*: By maintaining a synchronized auxiliary stack (`minStack`) that records the running minimum value at every stack depth.
2. **Backend**: What is an "Index-Only Scan" in PostgreSQL, and why is it faster than an "Index Scan"?
   * *Answer*: An Index-Only Scan satisfies the query entirely using the data stored directly within the B-Tree index leaves, eliminating the need to read table data from the disk heap.
3. **AI**: In `pgvector`, what is the difference between the `<->` operator and the `<=>` operator?
   * *Answer*: `<->` computes Euclidean Distance (L2 distance), while `<=>` computes Cosine Distance.