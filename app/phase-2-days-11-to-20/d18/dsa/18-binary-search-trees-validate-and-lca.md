# Day 18: Data Structures & Algorithms (DSA)

---

## 1. Binary Search Tree (BST) Properties
For every node in a BST:
$$\text{All nodes in Left Subtree} < \text{Node.val} < \text{All nodes in Right Subtree}$$

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Validate Binary Search Tree (LeetCode 98)
#### Optimal Solution: Valid Value Range Boundaries ($O(N)$ Time, $O(H)$ Space)
```typescript
function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, min: number | null, max: number | null): boolean {
    if (!node) return true;

    if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) {
      return false;
    }

    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }

  return validate(root, null, null);
}
```