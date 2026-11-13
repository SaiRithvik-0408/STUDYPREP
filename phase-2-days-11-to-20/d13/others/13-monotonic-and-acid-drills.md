# Day 13: Drills, Quizzes & Practical Exercises

1. **DSA**: Why does the Daily Temperatures problem have an $O(N)$ time complexity even though it has a nested while loop?
   * *Answer*: Each element is pushed onto the stack exactly once and popped from the stack at most once ($2N$ operations total across the entire array).
2. **Backend**: What is a "Phantom Read" in database transactions?
   * *Answer*: When a transaction re-runs a query searching for rows matching a condition (e.g. `WHERE balance > 1000`) and finds that another committed transaction has inserted new rows that now match the condition.
3. **AI**: Why does Reciprocal Rank Fusion (RRF) add a constant of 60 to the denominator?
   * *Answer*: The constant (typically 60) smooths the ranking curve, preventing top-ranked outliers in one single search method from excessively dominating the combined score.