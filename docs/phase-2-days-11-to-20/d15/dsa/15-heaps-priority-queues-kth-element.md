# Day 15: Data Structures & Algorithms (DSA)

---

## 1. Binary Heap Architecture

A **Binary Heap** is a complete binary tree stored inside a flat array:
* Parent at index $i$: Left Child at $2i + 1$, Right Child at $2i + 2$.
* Child at index $i$: Parent at $\lfloor (i - 1) / 2 \rfloor$.
* **Min-Heap**: Root is always the minimum element ($O(1)$ read, $O(\log N)$ push/pop).

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Kth Largest Element in an Array (LeetCode 215)
> **Problem Statement**: Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Must solve in $O(N)$ or $O(N \log K)$ time.

#### Optimal Solution: Min-Heap of Size K ($O(N \log K)$ Time, $O(K)$ Space)
Maintain a Min-Heap capped at size $K$. When finished, the root of the heap is the $K$th largest element!

```typescript
class MinHeap {
  private data: number[] = [];

  push(val: number) {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): number | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): number { return this.data[0]; }
  size(): number { return this.data.length; }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const p = Math.floor((idx - 1) / 2);
      if (this.data[idx] < this.data[p]) {
        [this.data[idx], this.data[p]] = [this.data[p], this.data[idx]];
        idx = p;
      } else break;
    }
  }

  private bubbleDown(idx: number) {
    const len = this.data.length;
    while (2 * idx + 1 < len) {
      let smallest = 2 * idx + 1;
      const right = smallest + 1;
      if (right < len && this.data[right] < this.data[smallest]) smallest = right;
      if (this.data[smallest] < this.data[idx]) {
        [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
        idx = smallest;
      } else break;
    }
  }
}

function findKthLargest(nums: number[], k: number): number {
  const minHeap = new MinHeap();
  for (const num of nums) {
    minHeap.push(num);
    if (minHeap.size() > k) {
      minHeap.pop();
    }
  }
  return minHeap.peek();
}
```