# Day 21: Drills, Quizzes & Practical Exercises

1. **DSA**: In Number of Islands, why is in-place mutation (`grid[r][c] = '0'`) better than an external visited Set?
   * *Answer*: It avoids the memory overhead of a Set ($O(M \cdot N)$ space) and eliminates hash collision lookup costs.
2. **Backend**: What is a "Bounded Context" in Domain-Driven Design?
   * *Answer*: A boundary within which a specific domain model applies. For example, a "User" in the Auth context has credentials, while in the Shipping context it has addresses.