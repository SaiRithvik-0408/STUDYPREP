# Day 3: Data Structures & Algorithms (DSA)

---

## 1. The Fixed-Size Sliding Window Paradigm

When a problem asks for contiguous segments (subarrays or substrings) of a **fixed length $K$**, computing each segment from scratch with nested loops wastes time:

```
Window 0: [ 1,  3,  2 ]  6,  4   -> Sum = 1 + 3 + 2 = 6
Window 1:   1, [ 3,  2,  6 ] 4   -> Sum = (OldSum - 1) + 6 = 11  (O(1) update!)
Window 2:   1,  3, [ 2,  6,  4 ] -> Sum = (OldSum - 3) + 4 = 12  (O(1) update!)
```

### The Math:
* In a naive nested loop: you perform $K$ additions for each of the $N - K + 1$ windows $\implies O(N \cdot K)$.
* With a Sliding Window: you compute the first window once ($K$ additions), and then slide forward by adding 1 incoming element and subtracting 1 outgoing element ($O(1)$) $\implies O(N)$.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Maximum Average Subarray I (LeetCode 643)
> **Problem Statement**: You are given an integer array `nums` consisting of $n$ elements, and an integer $k$. Find a contiguous subarray whose length is equal to $k$ that has the maximum average value and return this value.

#### Approach 1: Brute Force ($O(N \cdot K)$)
* Compute sum of all elements from $i$ to $i + k - 1$ for every possible index $i$.
* **Time Complexity**: $O(N \cdot K)$ — TLE for large $N$ and $K$.
* **Space Complexity**: $O(1)$.

```typescript
function findMaxAverageBrute(nums: number[], k: number): number {
  let maxAvg = -Infinity;

  for (let i = 0; i <= nums.length - k; i++) {
    let sum = 0;
    for (let j = i; j < i + k; j++) {
      sum += nums[j];
    }
    maxAvg = Math.max(maxAvg, sum / k);
  }

  return maxAvg;
}
```

#### Approach 2: Sliding Window (Optimal $O(N)$ Time, $O(1)$ Space)
* **Strategy**:
  1. Calculate the sum of the first $k$ elements (`windowSum`).
  2. Initialize `maxSum = windowSum`.
  3. Slide the window from index $k$ to $N - 1$:
     * Add `nums[i]` (incoming element).
     * Subtract `nums[i - k]` (outgoing element).
     * Update `maxSum = Math.max(maxSum, windowSum)`.
  4. Return `maxSum / k`.
* **Time Complexity**: $O(N)$ — Single linear pass.
* **Space Complexity**: $O(1)$.

```typescript
function findMaxAverageOptimal(nums: number[], k: number): number {
  let windowSum = 0;

  // Step 1: Compute initial window
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;

  // Step 2: Slide across the remaining elements
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    if (windowSum > maxSum) {
      maxSum = windowSum;
    }
  }

  return maxSum / k;
}
```

---

### Problem 2: Permutation in String (LeetCode 567)
> **Problem Statement**: Given two strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`, or `false` otherwise. In other words, return true if one of `s1`'s permutations is the substring of `s2`.

#### Approach 1: Generate All Permutations ($O(M! \cdot N)$)
* Generating all permutations of `s1` is factorial time. For length 10, $10! = 3.6 \times 10^6$ operations. Disqualified.

#### Approach 2: Sliding Window with Frequency Map Comparison ($O(26 \cdot N)$)
* A permutation of `s1` is simply an anagram of `s1`.
* Any valid substring in `s2` must have **exact length equal to `s1.length`** and **identical character frequencies**.
* Maintain a window of fixed size `s1.length` in `s2`. Compare frequency counts.

#### Approach 3: Optimized Sliding Window with Matches Count (Optimal $O(N)$)
* Instead of comparing 26 alphabet characters at every step, track a single variable `matches`: the count of distinct characters that currently match in frequency between `s1` and the window in `s2`.
* When `matches === 26`, a valid permutation is found!

```typescript
function checkInclusion(s1: string, s2: string): boolean {
  if (s1.length > s2.length) return false;

  const s1Count = new Array(26).fill(0);
  const s2Count = new Array(26).fill(0);
  const aCode = 'a'.charCodeAt(0);

  // Initialize frequency array for s1 and the first window of s2
  for (let i = 0; i < s1.length; i++) {
    s1Count[s1.charCodeAt(i) - aCode]++;
    s2Count[s2.charCodeAt(i) - aCode]++;
  }

  // Count initial matching characters
  let matches = 0;
  for (let i = 0; i < 26; i++) {
    if (s1Count[i] === s2Count[i]) matches++;
  }

  // Slide the window of fixed size s1.length
  for (let i = 0; i < s2.length - s1.length; i++) {
    if (matches === 26) return true;

    // Incoming character at right boundary
    const rightChar = s2.charCodeAt(i + s1.length) - aCode;
    s2Count[rightChar]++;
    if (s2Count[rightChar] === s1Count[rightChar]) {
      matches++;
    } else if (s2Count[rightChar] === s1Count[rightChar] + 1) {
      matches--;
    }

    // Outgoing character at left boundary
    const leftChar = s2.charCodeAt(i) - aCode;
    s2Count[leftChar]--;
    if (s2Count[leftChar] === s1Count[leftChar]) {
      matches++;
    } else if (s2Count[leftChar] === s1Count[leftChar] - 1) {
      matches--;
    }
  }

  return matches === 26;
}
// Time Complexity: O(N) where N = s2.length
// Space Complexity: O(1) — Fixed 26-element array
```
