# Day 23: Drills, Quizzes & Practical Exercises

1. **DSA**: In Kahn's algorithm, what does it mean if `completedCourses < numCourses` at the end?
   * *Answer*: It means the graph contains a **cycle** (circular dependency), preventing remaining nodes from ever reaching an in-degree of 0.
2. **Backend**: What is a "Hotspot" in database sharding?
   * *Answer*: When a poorly chosen shard key (e.g. timestamp) directs 90% of write traffic to a single shard server while other shards sit idle.