# Day 24: Drills, Quizzes & Practical Exercises

1. **DSA**: Why does Dijkstra's algorithm fail on graphs with negative edge weights?
   * *Answer*: Dijkstra assumes that once a node is visited via the shortest path, its distance cannot be improved. A negative edge can retroactively decrease the distance to an already-settled node (Bellman-Ford must be used instead).
2. **Backend**: According to PACELC, what does an AP/EL database trade off?
   * *Answer*: In normal operation, it prioritizes low Latency over Consistency; during a network partition, it prioritizes Availability over Consistency.