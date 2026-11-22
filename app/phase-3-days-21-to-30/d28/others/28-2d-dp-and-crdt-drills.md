# Day 28: Drills, Quizzes & Practical Exercises

1. **System Design**: Why did modern multiplayer tools switch from Operational Transformation (OT) to CRDTs?
   * *Answer*: OT requires a single centralized server to sequence operations, creating a single point of failure and high latency. CRDTs operate asynchronously on local state and mathematically guarantee convergence across offline clients.