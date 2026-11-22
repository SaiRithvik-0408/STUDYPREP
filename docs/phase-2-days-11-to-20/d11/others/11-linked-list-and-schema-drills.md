# Day 11: Drills, Quizzes & Practical Exercises

1. **DSA**: In Reversing a Linked List in-place, why do we need 3 pointers (`prev`, `curr`, `tempNext`)?
   * *Answer*: If we point `curr.next = prev` without saving the original `curr.next` in `tempNext` first, the reference to the rest of the list is severed in memory and permanently lost.
2. **Backend**: What is the difference between `ON DELETE CASCADE` and `ON DELETE SET NULL`?
   * *Answer*: `CASCADE` deletes all child rows when the parent row is deleted. `SET NULL` keeps the child rows intact but sets their foreign key column to `NULL`.
3. **AI**: Why does an HNSW index use more RAM than a Flat vector index?
   * *Answer*: HNSW constructs and stores multi-layer graph structures with adjacency edge lists for every vector, requiring additional memory overhead to achieve logarithmic search speed.