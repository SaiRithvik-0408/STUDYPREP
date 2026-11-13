# Day 17: Drills, Quizzes & Practical Exercises

1. **DSA**: In the Diameter of Binary Tree problem, why does the diameter not necessarily have to pass through the root node?
   * *Answer*: The longest path can exist entirely within a deeply unbalanced left or right subtree.
2. **AI**: Why not use Cross-Encoders for initial search over 1,000,000 documents?
   * *Answer*: Cross-encoders cannot be precomputed into vector indexes; comparing 1,000,000 documents with a cross-encoder would take minutes. Bi-encoders retrieve Top-50 in 5ms, and the Cross-Encoder re-ranks those 50 in 30ms.