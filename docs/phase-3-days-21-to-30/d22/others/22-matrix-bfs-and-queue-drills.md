# Day 22: Drills, Quizzes & Practical Exercises

1. **DSA**: Why is Multi-Source BFS used for Rotting Oranges instead of DFS?
   * *Answer*: BFS expands outward level by level simultaneously from all sources, matching the real-world progression of time (minutes). DFS would traverse one branch to the end, distorting time calculations.
2. **Backend**: What is the difference between a Message Queue (BullMQ) and a Pub/Sub topic?
   * *Answer*: A Message Queue delivers each job to **one worker** for processing with acknowledgments and retries. Pub/Sub broadcasts a message to **all active listeners** simultaneously with no persistence.