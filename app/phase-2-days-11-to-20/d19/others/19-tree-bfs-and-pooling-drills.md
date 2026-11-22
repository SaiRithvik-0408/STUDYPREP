# Day 19: Drills, Quizzes & Practical Exercises

1. **DSA**: In Tree BFS Level Order Traversal, why must we take a snapshot of `queue.length` before the inner loop?
   * *Answer*: Because the queue grows dynamically as child nodes are pushed. Taking `levelSize = queue.length` ensures the inner loop processes strictly the nodes belonging to the current depth level.
2. **Backend**: What are the 3 pooling modes of PgBouncer?
   * *Answer*: Session pooling (connection tied to client session), Transaction pooling (connection released as soon as transaction commits - most popular), and Statement pooling (connection released after every single SQL statement).