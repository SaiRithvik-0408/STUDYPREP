# Day 27: Data Structures & Algorithms (DSA)

---

## 1. Problem: Longest Increasing Subsequence (LeetCode 300)
#### Optimal Solution: Binary Search Patience Sorting ($O(N \log N)$ Time, $O(N)$ Space)
```typescript
function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];

  for (const num of nums) {
    let low = 0;
    let high = tails.length - 1;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      if (tails[mid] < num) low = mid + 1;
      else high = mid - 1;
    }

    if (low === tails.length) tails.push(num);
    else tails[low] = num;
  }

  return tails.length;
}
```