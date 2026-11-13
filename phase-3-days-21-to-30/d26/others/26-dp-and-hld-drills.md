# Day 26: Drills, Quizzes & Practical Exercises

1. **DSA**: In Coin Change, why initialize the DP array with `Infinity`?
   * *Answer*: Because we are searching for the **minimum** coins; `Infinity` ensures any valid combination computed with `Math.min()` overwrites the initial placeholder.
2. **System Design**: What is the difference between Round-Robin and Least-Connections load balancing?
   * *Answer*: Round-Robin distributes requests sequentially regardless of active connection count. Least-Connections routes requests to the server currently handling the fewest active connections, ideal for long-lived WebSocket or database queries.