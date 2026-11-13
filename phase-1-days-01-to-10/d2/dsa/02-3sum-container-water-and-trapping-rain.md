# Day 2: Data Structures & Algorithms (DSA)

---

## 1. Advanced Two-Pointer Patterns: Multi-Pointer & Boundary Bounding

Yesterday we used Two Pointers for simple sorted pairs and in-place swaps. Today we advance to:
1. **$K$-Sum Reduction**: Reducing high-order polynomial searches ($O(N^3)$) down by a full order of magnitude ($O(N^2)$) by sorting and fixing $K-2$ pointers.
2. **Greedy Boundary Squeezing**: Making locally optimal pointer movements based on physical boundaries (walls, heights).

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: 3Sum (LeetCode 15)
> **Problem Statement**: Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`. The solution set must not contain duplicate triplets.

#### Approach 1: Brute Force (Three Nested Loops)
* **Idea**: Loop through every index $i, j, k$. Sort each valid triplet and add to a Set of strings to avoid duplicates.
* **Time Complexity**: $O(N^3 \log 3) \approx O(N^3)$ — For $N = 3,000$, iterations $\approx 2.7 \times 10^{10}$ (Immediate TLE).
* **Space Complexity**: $O(N)$ for string set storage.

```typescript
function threeSumBruteForce(nums: number[]): number[][] {
  const resultSet = new Set<string>();
  const n = nums.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        if (nums[i] + nums[j] + nums[k] === 0) {
          const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
          resultSet.add(triplet.join(','));
        }
      }
    }
  }

  return Array.from(resultSet).map((str) => str.split(',').map(Number));
}
```

#### Approach 2: Sorting + Two Pointers (Optimal)
* **Strategy**:
  1. **Sort the array** in ascending order ($O(N \log N)$).
  2. Fix the first element `nums[i]` with a `for` loop.
  3. The problem now becomes: Find two numbers in `nums[i + 1 ... N - 1]` that add up to `target = -nums[i]`.
  4. Use standard Two Pointers (`left = i + 1`, `right = N - 1`).
  5. **Duplicate Prevention**:
     * If `nums[i] === nums[i - 1]`, skip it!
     * When a triplet is found, move `left` forward past duplicates (`nums[left] === nums[left + 1]`) and `right` backward past duplicates (`nums[right] === nums[right - 1]`).
* **Time Complexity**: $O(N^2)$ — Sorting is $O(N \log N)$, outer loop runs $N$ times, inner two pointers run $O(N)$.
* **Space Complexity**: $O(1)$ auxiliary space (ignoring sorting recursion stack).

```typescript
function threeSumOptimal(nums: number[]): number[][] {
  const result: number[][] = [];
  nums.sort((a, b) => a - b); // Step 1: Sort ascending

  for (let i = 0; i < nums.length - 2; i++) {
    // Optimization: If current number is > 0, three positive numbers can never sum to 0
    if (nums[i] > 0) break;

    // Skip duplicate starting numbers
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;
    const target = -nums[i];

    while (left < right) {
      const sum = nums[left] + nums[right];

      if (sum === target) {
        result.push([nums[i], nums[left], nums[right]]);

        // Skip duplicates for left pointer
        while (left < right && nums[left] === nums[left + 1]) left++;
        // Skip duplicates for right pointer
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

---

### Problem 2: Container With Most Water (LeetCode 11)
> **Problem Statement**: Given an integer array `height` of length $n$. Find two lines that together with the x-axis form a container that stores the most water. Return the maximum area.

#### Approach 1: Brute Force
* Check every pair of indices $(i, j)$: $\text{Area} = \min(h[i], h[j]) \times (j - i)$.
* **Time Complexity**: $O(N^2)$ | **Space Complexity**: $O(1)$.

#### Approach 2: Greedy Converging Two Pointers (Optimal)
* **The Core Mathematical Intuition**:
  * Width is maximized at the extreme ends: `left = 0`, `right = height.length - 1`.
  * The height of the water is **bottlenecked by the shorter line**: $\text{Height} = \min(h[left], h[right])$.
  * Which pointer should we move?
    * If we move the taller line inward: the width decreases, but the height is still bottlenecked by the existing short line (or something even shorter). The area is guaranteed to decrease!
    * Therefore, our only chance to increase the area is to **move the pointer pointing to the shorter line**, searching for a taller line that compensates for the lost width.
* **Time Complexity**: $O(N)$ — Single pass.
* **Space Complexity**: $O(1)$.

```typescript
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;

    if (area > maxWater) {
      maxWater = area;
    }

    // Move the shorter barrier inward
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}
```

---

### Problem 3: Trapping Rain Water (LeetCode 42)
> **Problem Statement**: Given $n$ non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

#### Approach 1: Dynamic Programming / Prefix-Suffix Arrays ($O(N)$ Time, $O(N)$ Space)
* For each bar $i$, the water trapped on top of it is:
  $$\text{Water}[i] = \max(0, \min(\text{maxToLeft}[i], \text{maxToRight}[i]) - \text{height}[i])$$
* Precompute `leftMax[i]` from left to right, and `rightMax[i]` from right to left using two arrays.
* **Time Complexity**: $O(N)$ | **Space Complexity**: $O(N)$ (Requires two extra arrays).

#### Approach 2: Two Pointers (Optimal $O(N)$ Time, $O(1)$ Space)
* **Intuition**:
  Instead of precomputing full arrays, maintain `leftMax` and `rightMax` variables dynamically with two converging pointers.
  * If `height[left] < height[right]`: We know for certain that the right side has a bar at least as tall as `height[left]`. Therefore, the water trapped at `left` depends **only on `leftMax`**!
    * If `height[left] >= leftMax`, update `leftMax = height[left]`.
    * Else, `water += leftMax - height[left]`.
    * `left++`.
  * Else (`height[right] <= height[left]`): The water trapped at `right` depends **only on `rightMax`**!
    * If `height[right] >= rightMax`, update `rightMax = height[right]`.
    * Else, `water += rightMax - height[right]`.
    * `right--`.
* **Time Complexity**: $O(N)$ | **Space Complexity**: $O(1)$.

```typescript
function trap(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }

  return totalWater;
}
```
