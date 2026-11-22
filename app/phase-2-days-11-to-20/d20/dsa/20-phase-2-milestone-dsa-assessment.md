# Day 20: Data Structures & Algorithms (DSA) — Milestone Assessment

---

## 1. Problem: Lowest Common Ancestor of a Binary Tree (LeetCode 236)
```typescript
function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root; // p and q are in opposite subtrees: root is the LCA!
  return left ? left : right;
}
```