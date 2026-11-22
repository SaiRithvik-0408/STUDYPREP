# Day 10: Data Structures & Algorithms (DSA) — Pattern Synthesis

---

## 1. The Holy Grail Problem: Minimum Window Substring (LeetCode 76 - Hard)

> **Problem Statement**: Given two strings `s` and `t` of lengths $m$ and $n$ respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.

### The Strategy: Dynamic Sliding Window with `have` and `need`
* Maintain a frequency map `countT` of all characters in `t`.
* Maintain a frequency map `window` of characters currently inside `s[left ... right]`.
* Let `need = countT.size` (number of unique characters that must meet required frequencies).
* Let `have = 0` (number of unique characters currently meeting required frequencies).
* **Algorithm**:
  1. Expand `right`. If `s[right]` exists in `countT`, increment `window[s[right]]`.
  2. If `window[s[right]] === countT[s[right]]`, increment `have++`.
  3. While `have === need` (valid window):
     * Check if current window length $(right - left + 1)$ is smaller than our record minimum.
     * Shrink window from the left by decrementing `window[s[left]]` and advancing `left++`.
     * If `window[s[left]] < countT[s[left]]`, decrement `have--`.

```typescript
function minWindow(s: string, t: string): string {
  if (t.length === 0 || s.length < t.length) return '';

  const countT = new Map<string, number>();
  for (const char of t) {
    countT.set(char, (countT.get(char) || 0) + 1);
  }

  const window = new Map<string, number>();
  let have = 0;
  const need = countT.size;

  let minLen = Infinity;
  let minStart = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    window.set(char, (window.get(char) || 0) + 1);

    if (countT.has(char) && window.get(char) === countT.get(char)) {
      have++;
    }

    // Shrink window from the left while condition is satisfied
    while (have === need) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }

      // Pop s[left] from window
      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar)! - 1);
      if (countT.has(leftChar) && window.get(leftChar)! < countT.get(leftChar)!) {
        have--;
      }

      left++;
    }
  }

  return minLen === Infinity ? '' : s.substring(minStart, minStart + minLen);
}
// Time Complexity: O(N) — Linear scan.
// Space Complexity: O(M) where M is distinct characters in t.
```

---

## 2. Search a 2D Matrix (LeetCode 74)

> **Problem Statement**: You are given an $m \times n$ integer matrix with the following two properties:
> 1. Each row is sorted in non-decreasing order.
> 2. The first integer of each row is greater than the last integer of the previous row.
> Given an integer `target`, return `true` if `target` is in `matrix` or `false` otherwise. Solution must be $O(\log(m \cdot n))$.

### The Mathematical 1D Mapping:
Because every row continues strictly in sorted order, the entire 2D matrix can be treated as a **single virtual 1D array of length $m \cdot n$**:

$$\text{row} = \left\lfloor \frac{\text{mid}}{\text{cols}} \right\rfloor$$
$$\text{col} = \text{mid} \pmod{\text{cols}}$$

```typescript
function searchMatrix(matrix: number[][], target: number): boolean {
  if (matrix.length === 0) return false;

  const rows = matrix.length;
  const cols = matrix[0].length;
  let low = 0;
  let high = rows * cols - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);

    // Map 1D mid index to 2D row and column
    const r = Math.floor(mid / cols);
    const c = mid % cols;
    const midVal = matrix[r][c];

    if (midVal === target) {
      return true;
    } else if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return false;
}
// Time Complexity: O(log(M * N)) — Single binary search.
// Space Complexity: O(1)
```
