# Day 16: Data Structures & Algorithms (DSA)

---

## 1. Binary Tree Memory Layout

Unlike arrays or linked lists, a **Binary Tree** has a branching factor of 2. Each node contains a value and two child pointers: `left` and `right`:

```
       [ 1 ]
      /     \
   [ 2 ]   [ 3 ]
   /   \
[ 4 ] [ 5 ]
```

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Binary Tree Inorder Traversal (LeetCode 94)
> **Traversal Order**: Left $\to$ Root $\to$ Right (For BST, inorder yields strictly sorted values!).

#### Approach 1: Recursive Traversal ($O(N)$ Time, $O(H)$ Stack Space)
```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

function inorderTraversalRecursive(root: TreeNode | null): number[] {
  const result: number[] = [];
  function traverse(node: TreeNode | null) {
    if (!node) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  }
  traverse(root);
  return result;
}
```

#### Approach 2: Iterative Traversal with Explicit Stack ($O(N)$ Time, $O(H)$ Space)
```typescript
function inorderTraversalIterative(root: TreeNode | null): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let curr = root;

  while (curr !== null || stack.length > 0) {
    // 1. Push all left children onto stack
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left;
    }

    // 2. Pop node and visit
    curr = stack.pop()!;
    result.push(curr.val);

    // 3. Move to right child
    curr = curr.right;
  }

  return result;
}
```