# Day 5: Data Structures & Algorithms (DSA)

---

## 1. Floyd's Tortoise & Hare Cycle-Finding Algorithm

The Fast & Slow Pointer technique (Floyd's Cycle Detection) moves two pointers through a sequence at **different speeds**:
* **Slow Pointer (`tortoise`)**: Moves 1 step at a time.
* **Fast Pointer (`hare`)**: Moves 2 steps at a time.

```
Cycle Detection:
[ Head ] ──► [ 1 ] ──► [ 2 ] ──► [ 3 ] ──► [ 4 ]
                                   ▲         │
                                   │         ▼
                                 [ 6 ] ◄── [ 5 ]
```

### The Mathematical Proof of Meeting:
* If no cycle exists, `fast` reaches `null` ($O(N)$ time).
* If a cycle exists:
  * Once both pointers enter the cycle, let the distance between them along the cycle be $d$.
  * On every single step, `fast` moves 2 nodes forward while `slow` moves 1 node forward.
  * The relative distance between them changes by:
    $$\Delta = 2 - 1 = +1 \text{ node per step}$$
  * Therefore, `fast` reduces the gap by exactly 1 node on each iteration. It is **mathematically impossible** for `fast` to "hop over" `slow` without colliding! They must meet in at most $C$ iterations (where $C$ is cycle length).
* **Space Complexity**: $O(1)$ — No hash tables required.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Linked List Cycle I (LeetCode 141)
> **Problem Statement**: Given `head`, the head of a linked list, determine if the linked list has a cycle in it. Return `true` if there is a cycle, otherwise `false`.

#### Approach 1: Hash Set of Visited Nodes
* Traverse list, store every node reference in a `Set`. If `set.has(current)`, return `true`.
* **Time Complexity**: $O(N)$ | **Space Complexity**: $O(N)$ (Allocates extra memory).

#### Approach 2: Floyd's Two Pointers (Optimal $O(N)$ Time, $O(1)$ Space)
```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;

  let slow: ListNode | null = head;
  let fast: ListNode | null = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true; // Cycle detected!
    }
  }

  return false; // Reached end of list
}
```

---

### Problem 2: Linked List Cycle II — Find Entry Node (LeetCode 142)
> **Problem Statement**: Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return `null`. Do not modify the linked list. Must use $O(1)$ memory.

#### The Mathematical Proof:
1. Let $L$ = distance from `head` to the start of the cycle.
2. Let $X$ = distance from cycle start to the point where `slow` and `fast` collide.
3. Let $C$ = total perimeter/length of the cycle.
4. Total distance traveled by `slow`: $D_{\text{slow}} = L + X$
5. Total distance traveled by `fast`: $D_{\text{fast}} = L + nC + X$ (where $n \ge 1$ is complete loops around the cycle).
6. Since `fast` travels at twice the speed of `slow`:
   $$2 \times D_{\text{slow}} = D_{\text{fast}}$$
   $$2(L + X) = L + nC + X$$
   $$2L + 2X = L + nC + X$$
   $$\mathbf{L = nC - X = (n - 1)C + (C - X)}$$

#### The Conclusion:
$L$ (distance from `head` to cycle start) equals $(C - X)$ (distance from the collision point to cycle start)!
* **Algorithm**:
  1. Find meeting point using fast & slow pointers.
  2. If they meet, reset `slow` to `head` while leaving `fast` at the meeting point.
  3. Move both pointers **1 step at a time**.
  4. The exact node where they collide is **the entry node of the cycle**!

```typescript
function detectCycle(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return null;

  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  let hasCycle = false;

  // Phase 1: Detect if a cycle exists
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) {
      hasCycle = true;
      break;
    }
  }

  if (!hasCycle) return null;

  // Phase 2: Find cycle start node
  slow = head; // Reset slow to head
  while (slow !== fast) {
    slow = slow!.next;
    fast = fast!.next;
  }

  return slow; // The start of the cycle!
}
// Time Complexity: O(N)
// Space Complexity: O(1)
```

---

### Problem 3: Happy Number (LeetCode 202)
> **Problem Statement**: Starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat the process until the number equals 1, or it **loops endlessly in a cycle** which does not include 1. Those numbers for which this process ends in 1 are happy. Return `true` if happy, `false` if not.

#### Optimal Solution: Implicit Cycle Detection ($O(\log N)$ Time, $O(1)$ Space)
Instead of a Linked List, the pointers operate on the integer state:

```typescript
function isHappy(n: number): boolean {
  function getNext(num: number): number {
    let totalSum = 0;
    while (num > 0) {
      const digit = num % 10;
      totalSum += digit * digit;
      num = Math.floor(num / 10);
    }
    return totalSum;
  }

  let slow = n;
  let fast = getNext(n);

  while (fast !== 1 && slow !== fast) {
    slow = getNext(slow);           // 1 step
    fast = getNext(getNext(fast)); // 2 steps
  }

  return fast === 1;
}
```
