# Day 4: Data Structures & Algorithms (DSA)

---

## 1. The Variable-Size Sliding Window Paradigm

Unlike fixed-size windows where the window length $K$ is constant, variable-size windows **dynamically expand and contract** based on whether a condition is satisfied.

```
Step 1: Expand right boundary to include new element.
[ Left ──────────────────────── Right ]  (Condition becomes INVALID)

Step 2: Shrink left boundary until condition becomes VALID again.
        [ Left ──────────────── Right ]  (Valid!)

Step 3: Update global answer (e.g. maxLength = Math.max(maxLength, Right - Left + 1)).
```

### The Universal Template for Variable Windows:
```typescript
function variableWindowTemplate(arr: any[]) {
  let left = 0;
  let bestResult = 0; // or Infinity for min length

  for (let right = 0; right < arr.length; right++) {
    // 1. Incorporate arr[right] into window state

    // 2. While window condition is violated (or valid if seeking minimum)
    while (/* condition invalid */) {
      // Evict arr[left] from window state
      left++;
    }

    // 3. Update global result
    bestResult = Math.max(bestResult, right - left + 1);
  }

  return bestResult;
}
```

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Longest Substring Without Repeating Characters (LeetCode 3)
> **Problem Statement**: Given a string `s`, find the length of the longest substring without duplicate characters.

#### Approach 1: Brute Force ($O(N^3)$)
* Generate all possible substrings $O(N^2)$, check if characters are unique using a Set $O(N)$.
* For $N = 50,000$, iterations $\approx 1.25 \times 10^{14}$ (Immediate TLE).

#### Approach 2: Sliding Window with Set ($O(2N) = O(N)$)
* Expand `right`. If `s[right]` is already in the Set, increment `left` and delete `s[left]` from the Set one-by-one until the duplicate is evicted.
* Each character can be visited twice (once by `right`, once by `left`).

#### Approach 3: Sliding Window with Hash Map Index Cache (Optimal $O(N)$)
* Instead of moving `left` one step at a time, store the **last seen index** of each character in a Map (`lastSeenIndex`).
* When a duplicate character is encountered at `s[right]`:
  * If its last seen index is $\ge$ `left`, jump `left` directly to `lastSeenIndex + 1` in $O(1)$!
* Update `lastSeen.set(char, right)`.
* **Time Complexity**: $O(N)$ — Single pass; `left` only jumps forward.
* **Space Complexity**: $O(\min(N, M))$ where $M$ is the character set size (at most 128 for ASCII).

```typescript
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If character was already seen inside current active window
    if (lastSeen.has(char) && lastSeen.get(char)! >= left) {
      // Jump left pointer past the previous occurrence
      left = lastSeen.get(char)! + 1;
    }

    lastSeen.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```

#### Step-by-Step State Evolution:
Input: `s = "abcabcbb"`

| `right` | `char` | `lastSeen` Check | `left` Pointer | Window Substring | `maxLength` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 'a' | None | 0 | `"a"` (len 1) | 1 |
| 1 | 'b' | None | 0 | `"ab"` (len 2) | 2 |
| 2 | 'c' | None | 0 | `"abc"` (len 3) | 3 |
| 3 | 'a' | Seen at idx 0 ($\ge 0$) | Jump `left = 0 + 1 = 1` | `"bca"` (len 3) | 3 |
| 4 | 'b' | Seen at idx 1 ($\ge 1$) | Jump `left = 1 + 1 = 2` | `"cab"` (len 3) | 3 |
| 5 | 'c' | Seen at idx 2 ($\ge 2$) | Jump `left = 2 + 1 = 3` | `"abc"` (len 3) | 3 |
| 6 | 'b' | Seen at idx 4 ($\ge 3$) | Jump `left = 4 + 1 = 5` | `"cb"` (len 2) | 3 |
| 7 | 'b' | Seen at idx 6 ($\ge 5$) | Jump `left = 6 + 1 = 7` | `"b"` (len 1) | 3 |

**Result**: `3` (from `"abc"`).

---

### Problem 2: Minimum Size Subarray Sum (LeetCode 209)
> **Problem Statement**: Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a contiguous subarray of which the sum is greater than or equal to `target`. If there is no such subarray, return 0.

#### Approach 1: Brute Force ($O(N^2)$)
* Test all subarrays starting at index $i$ and summing forward until $\ge \text{target}$.

#### Approach 2: Sliding Window with While-Shrink (Optimal $O(N)$ Time, $O(1)$ Space)
* **Strategy**:
  * Expand `right` and add `nums[right]` to `currentSum`.
  * As long as `currentSum >= target` (valid condition):
    * Record candidate minimum length: `minLength = Math.min(minLength, right - left + 1)`.
    * Subtract `nums[left]` from `currentSum` and shrink window by advancing `left++`.
* **Time Complexity**: $O(N)$ — Although there is a nested while-loop, each element is added by `right` at most once and removed by `left` at most once ($2N$ operations total).
* **Space Complexity**: $O(1)$ auxiliary space.

```typescript
function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let currentSum = 0;
  let minLength = Infinity;

  for (let right = 0; right < nums.length; right++) {
    currentSum += nums[right];

    // Shrink window from the left as long as the sum is >= target
    while (currentSum >= target) {
      minLength = Math.min(minLength, right - left + 1);
      currentSum -= nums[left];
      left++;
    }
  }

  return minLength === Infinity ? 0 : minLength;
}
```

---

### Problem 3: Longest Repeating Character Replacement (LeetCode 424)
> **Problem Statement**: You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most $k$ times. Return the length of the longest substring containing the same letter you can get after performing the above operations.

#### Optimal Solution: Frequency Window ($O(N)$ Time, $O(1)$ Space)
* **Mathematical Intuition**:
  $$\text{Window Length} - \text{Count of Most Frequent Character in Window} \le k$$
  If the number of characters that need to be replaced is $\le k$, the window is valid.
  If it exceeds $k$, shrink `left++`.

```typescript
function characterReplacement(s: string, k: number): number {
  const count = new Array(26).fill(0);
  const aCode = 'A'.charCodeAt(0);
  let left = 0;
  let maxFreq = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    const charCode = s.charCodeAt(right) - aCode;
    count[charCode]++;
    maxFreq = Math.max(maxFreq, count[charCode]);

    // Current window length: (right - left + 1)
    // If replacements needed > k, shrink window
    while ((right - left + 1) - maxFreq > k) {
      count[s.charCodeAt(left) - aCode]--;
      left++;
    }

    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
```
