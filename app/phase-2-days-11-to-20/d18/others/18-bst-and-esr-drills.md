# Day 18: Drills, Quizzes & Practical Exercises

1. **DSA**: In Validate BST, why is checking `node.left.val < node.val` and `node.right.val > node.val` insufficient?
   * *Answer*: Because a node in the left subtree could have a value greater than an ancestor root node further up the tree. You must pass valid minimum and maximum boundaries down the recursion.
2. **Backend**: What happens if you violate the ESR rule by putting Range fields before Sort fields in a MongoDB index?
   * *Answer*: MongoDB will be forced to perform an in-memory sort on all matching documents, degrading query performance.