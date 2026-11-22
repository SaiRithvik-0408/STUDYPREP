# Day 17: Data Structures & Algorithms (DSA)

---

## 1. Problem: Diameter of Binary Tree (LeetCode 543)
> **Problem Statement**: Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes in a tree.

#### Optimal Solution: Bottom-Up Postorder Recursion ($O(N)$ Time, $O(H)$ Space)
```typescript
function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;

  function maxDepth(node: TreeNode | null): number {
    if (!node) return 0;

    const leftDepth = maxDepth(node.left);
    const rightDepth = maxDepth(node.right);

    // Longest path passing through current node
    maxDiameter = Math.max(maxDiameter, leftDepth + rightDepth);

    return 1 + Math.max(leftDepth, rightDepth);
  }

  maxDepth(root);
  return maxDiameter;
}
```