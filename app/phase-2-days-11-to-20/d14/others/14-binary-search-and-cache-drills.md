# Day 14: Drills, Quizzes & Practical Exercises

1. **DSA**: In Koko Eating Bananas, how do we determine the initial search range $[\text{low}, \text{high}]$?
   * *Answer*: Low is 1 (minimum eating speed of 1 banana/hour). High is $\max(\text{piles})$ (eating the largest pile in 1 hour).
2. **Backend**: What is the danger of Write-Behind (Write-Back) caching?
   * *Answer*: If the cache server crashes before queued writes are flushed to the primary database, data is permanently lost.