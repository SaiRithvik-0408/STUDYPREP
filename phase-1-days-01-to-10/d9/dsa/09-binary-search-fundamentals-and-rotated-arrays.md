# Day 9: Data Structures & Algorithms (DSA)

---

## 1. Binary Search: The Divide & Conquer Paradigm

Binary search is an algorithm that finds the position of a target value within a sorted array. By comparing the target with the middle element, it eliminates **half of the remaining search space on every iteration**:

$$T(N) = T(N / 2) + O(1) \implies \mathbf{O(\log N)}$$

* For $1,000,000$ elements, linear search takes up to $1,000,000$ operations. Binary search takes at most **20 operations** ($\log_2(10^6) \approx 19.9$)!

### The Integer Overflow Trap:
In many programming languages, computing midpoint using:
`mid = (low + high) / 2`
causes a fatal integer overflow bug if `low + high > 2^{31} - 1`.
* **Universal Production Standard**:
  $$\mathbf{\text{mid} = \text{low} + \left\lfloor \frac{\text{high} - \text{low}}{2} \right\rfloor}$$

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Binary Search (LeetCode 704)
> **Problem Statement**: Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.

```typescript
function search(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }

  return -1;
}
// Time Complexity: O(log N)
// Space Complexity: O(1)
```

---

### Problem 2: Search in Rotated Sorted Array (LeetCode 33)
> **Problem Statement**: Given an integer array `nums` sorted in ascending order (with distinct values) that has been rotated at an unknown pivot, find `target` in $O(\log N)$ time.

#### The Core Insight: One Half is ALWAYS Strictly Sorted!
No matter where a sorted array is rotated, **dividing it in half always yields at least one half that is strictly sorted**:

```
Array: [ 4,  5,  6,  7,  0,  1,  2 ], target = 0
Midpoint = 7 (index 3)
Left half: [ 4, 5, 6, 7 ] -> Strictly sorted! (nums[low] <= nums[mid])
Right half: [ 7, 0, 1, 2 ] -> Rotated!
```

#### Algorithm:
1. If `nums[low] <= nums[mid]`, the **left half is sorted**:
   * Does `target` lie inside `[nums[low], nums[mid]]`?
     * If yes: `high = mid - 1` (Search left half).
     * If no: `low = mid + 1` (Search right half).
2. Otherwise, the **right half must be sorted**:
   * Does `target` lie inside `[nums[mid], nums[high]]`?
     * If yes: `low = mid + 1` (Search right half).
     * If no: `high = mid - 1` (Search left half).

```typescript
function searchRotated(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);

    if (nums[mid] === target) return mid;

    // Check if left half is strictly sorted
    if (nums[low] <= nums[mid]) {
      // Is target within left half bounds?
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    // Otherwise, right half must be sorted
    else {
      // Is target within right half bounds?
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }

  return -1;
}
// Time Complexity: O(log N)
// Space Complexity: O(1)
```

---

### Problem 3: Find Minimum in Rotated Sorted Array (LeetCode 153)
> **Problem Statement**: Given a sorted rotated array of unique elements, return the minimum element of this array in $O(\log N)$ time.

#### Optimal Solution: Comparing Mid with High Boundary
* If `nums[mid] > nums[high]`, the inflection pivot point (and therefore the minimum element) **must be in the right half**: `low = mid + 1`.
* If `nums[mid] <= nums[high]`, the minimum element is either at `mid` or to its left: `high = mid`.

```typescript
function findMin(nums: number[]): number {
  let low = 0;
  let high = nums.length - 1;

  while (low < high) {
    const mid = Math.floor(low + (high - low) / 2);

    if (nums[mid] > nums[high]) {
      // Minimum is strictly to the right of mid
      low = mid + 1;
    } else {
      // Minimum is at mid or to the left of mid
      high = mid;
    }
  }

  return nums[low];
}
```
