# Day 11: Data Structures & Algorithms (DSA)

---

## 1. Linked List Physical Memory Architecture

Unlike arrays where elements are contiguous in physical RAM, a **Linked List** is composed of disjoint nodes allocated across arbitrary heap memory addresses, connected via pointer references:

```
Node A [Val: 10 | Next: 0x48A0] ──► Node B [Val: 20 | Next: 0x91F0] ──► Node C [Val: 30 | Next: null]
Address: 0x1000                      Address: 0x48A0                      Address: 0x91F0
```

### Trade-Offs vs Arrays:
* **Element Lookup (`nodeAt(i)`)**: $O(N)$ linear time (CPU must follow pointers sequentially; cannot do pointer arithmetic).
* **Insertion/Deletion at Head / Known Node**: $O(1)$ constant time (simple pointer reassignment without memory shifting).
* **CPU Cache Locality**: Poor. Nodes are scattered in memory, resulting in frequent CPU L1/L2 cache misses.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Reverse Linked List (LeetCode 206)
> **Problem Statement**: Given the `head` of a singly linked list, reverse the list, and return the reversed list.

#### Optimal Solution: Iterative 3-Pointer In-Place Reversal ($O(N)$ Time, $O(1)$ Space)
```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;

  while (curr !== null) {
    const tempNext: ListNode | null = curr.next; // 1. Save next node
    curr.next = prev;                            // 2. Reverse pointer direction
    prev = curr;                                 // 3. Move prev forward
    curr = tempNext;                             // 4. Move curr forward
  }

  return prev; // prev is now the new head of the reversed list!
}
```

---

### Problem 2: Merge Two Sorted Lists (LeetCode 21)
> **Problem Statement**: Merge two sorted linked lists into one sorted list in-place.

#### Optimal Solution: Dummy Head Pointer ($O(N + M)$ Time, $O(1)$ Space)
```typescript
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode(-1);
  let tail = dummy;

  let p1 = list1;
  let p2 = list2;

  while (p1 !== null && p2 !== null) {
    if (p1.val <= p2.val) {
      tail.next = p1;
      p1 = p1.next;
    } else {
      tail.next = p2;
      p2 = p2.next;
    }
    tail = tail.next;
  }

  tail.next = p1 !== null ? p1 : p2;
  return dummy.next;
}
```

---

### Problem 3: Reorder List (LeetCode 143)
> **Problem Statement**: Reorder list from $L_0 \to L_1 \to \dots \to L_{n-1} \to L_n$ to $L_0 \to L_n \to L_1 \to L_{n-1} \dots$ in-place.

#### Optimal Solution: 3-Step Combination ($O(N)$ Time, $O(1)$ Space)
1. Find middle of list using Fast & Slow pointers.
2. Reverse the second half of the list in-place.
3. Merge the first half and the reversed second half alternately.

```typescript
function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;

  // Step 1: Find midpoint
  let slow: ListNode | null = head;
  let fast: ListNode | null = head.next;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }

  // Step 2: Reverse second half
  let secondHalf: ListNode | null = slow!.next;
  slow!.next = null; // Split lists
  let prev: ListNode | null = null;
  let curr = secondHalf;
  while (curr) {
    const nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  secondHalf = prev;

  // Step 3: Interweave two lists
  let first: ListNode | null = head;
  let second: ListNode | null = secondHalf;
  while (second) {
    const tmp1 = first!.next;
    const tmp2 = second.next;

    first!.next = second;
    second.next = tmp1;

    first = tmp1;
    second = tmp2;
  }
}
```