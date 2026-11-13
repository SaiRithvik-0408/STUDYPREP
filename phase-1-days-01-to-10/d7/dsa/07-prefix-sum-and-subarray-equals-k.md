# Day 7: Data Structures & Algorithms (DSA)

---

## 1. The Prefix Sum Paradigm

A **Prefix Sum** array precomputes the cumulative sum of elements from index 0 to $i$:

$$\text{Prefix}[i] = \sum_{k=0}^{i} \text{nums}[k] = \text{Prefix}[i - 1] + \text{nums}[i]$$

```
Original Array: [  2,   4,   1,   3,   5  ]
Prefix Sum:     [  2,   6,   7,  10,  15  ]
Indices:           0    1    2    3    4
```

### The $O(1)$ Range Sum Formula:
To find the sum of any contiguous subarray from index $i$ to $j$:
$$\text{Sum}(i, j) = \text{Prefix}[j] - \text{Prefix}[i - 1]$$
Instead of running a loop of length $(j - i + 1)$, we calculate the sum in **one single subtraction $O(1)$**!

### ⚠️ Why Sliding Window FAILS When Numbers Can Be Negative:
A common interview mistake: trying to use a Two-Pointer Sliding Window for sum problems with negative numbers.
* Sliding windows rely on **monotonicity**: expanding `right` increases the sum, shrinking `left` decreases the sum.
* If negative numbers exist, adding a number might decrease the sum! Monotonicity is destroyed.
* **The Rule**: If the array can contain negative numbers and asks for subarray sums, **you MUST use Prefix Sum + HashMap**!

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Subarray Sum Equals K (LeetCode 560)
> **Problem Statement**: Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`. (Note: elements can be negative!).

#### Approach 1: Brute Force with Cumulative Sum ($O(N^2)$)
* Check every subarray $(i, j)$: loop $i$ from 0 to $N-1$, maintain a running sum to $j$.
* **Time Complexity**: $O(N^2)$ — TLE for $N = 20,000$ ($4 \times 10^8$ operations).
* **Space Complexity**: $O(1)$.

#### Approach 2: Prefix Sum + Frequency HashMap (Optimal $O(N)$ Time, $O(N)$ Space)
* **The Core Mathematical Deduction**:
  * Let `currentSum` be the cumulative sum from index 0 to the current index.
  * We want to find a past index whose prefix sum satisfies:
    $$\text{currentSum} - \text{pastPrefixSum} = k$$
    $$\implies \mathbf{\text{pastPrefixSum} = \text{currentSum} - k}$$
  * If `currentSum - k` exists in our HashMap, then every time that past sum occurred marks a valid subarray ending at our current index that sums to $k$!
* **Base Case**: We must initialize `map.set(0, 1)`. Why?
  * If `currentSum === k`, then `currentSum - k = 0`. The base case `0: 1` counts this entire subarray from index 0!

```typescript
function subarraySum(nums: number[], k: number): number {
  // Map stores: [prefixSum -> frequency of occurrence]
  const prefixCount = new Map<number, number>();

  // Base case: a prefix sum of 0 has occurred 1 time (empty subarray)
  prefixCount.set(0, 1);

  let currentSum = 0;
  let totalSubarrays = 0;

  for (const num of nums) {
    currentSum += num;

    // Check if (currentSum - k) occurred previously
    const target = currentSum - k;
    if (prefixCount.has(target)) {
      totalSubarrays += prefixCount.get(target)!;
    }

    // Record the current prefix sum in the map
    prefixCount.set(currentSum, (prefixCount.get(currentSum) || 0) + 1);
  }

  return totalSubarrays;
}
// Time Complexity: O(N) — Single pass.
// Space Complexity: O(N) — Up to N unique prefix sums.
```

---

### Problem 2: Continuous Subarray Sum (LeetCode 523)
> **Problem Statement**: Given an integer array `nums` and an integer `k`, return `true` if `nums` has a continuous subarray of size at least two whose elements sum up to a multiple of `k`, or `false` otherwise.

#### Mathematical Intuition: Modulo Congruence
* If two prefix sums have the exact same remainder when divided by $k$:
  $$\text{Prefix}[j] \pmod k = \text{Prefix}[i] \pmod k$$
  $$\implies (\text{Prefix}[j] - \text{Prefix}[i]) \pmod k = 0$$
* This means the subarray between index $i$ and $j$ **must be a multiple of $k$**!
* We store `[remainder -> first seen index]`. If we see the same remainder again at index $j$ and $(j - i \ge 2)$, we found a valid subarray!

```typescript
function checkSubarraySum(nums: number[], k: number): boolean {
  // Map stores: [remainder -> earliest index where it occurred]
  const remainderMap = new Map<number, number>();

  // Base case: remainder 0 before any elements (index -1)
  remainderMap.set(0, -1);

  let runningSum = 0;

  for (let i = 0; i < nums.length; i++) {
    runningSum += nums[i];
    const remainder = ((runningSum % k) + k) % k; // Handles negative modulo in JS

    if (remainderMap.has(remainder)) {
      const prevIndex = remainderMap.get(remainder)!;
      if (i - prevIndex >= 2) {
        return true;
      }
    } else {
      // ONLY record the FIRST occurrence to maximize subarray length!
      remainderMap.set(remainder, i);
    }
  }

  return false;
}
```
