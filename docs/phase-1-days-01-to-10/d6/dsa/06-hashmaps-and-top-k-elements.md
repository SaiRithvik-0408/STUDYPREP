# Day 6: Data Structures & Algorithms (DSA)

---

## 1. Advanced Hash Table Techniques

Hash tables provide expected $O(1)$ lookups and insertions. Today we move beyond simple key-value lookups to:
1. **Canonical Hash Keying**: Converting complex objects/strings into canonical representative keys (e.g. character frequency tuples).
2. **Bucket Sort Reduction**: Transforming frequency-based search problems from $O(N \log N)$ to **$O(N)$ linear time** by mapping frequencies directly to array indices!
3. **Set Sequence Starting-Point Filtering**: Using a Set to identify only the absolute start of a sequence (`!set.has(num - 1)`), eliminating redundant checks.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Group Anagrams (LeetCode 49)
> **Problem Statement**: Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

#### Approach 1: Sorting Each String as Hash Key ($O(N \cdot K \log K)$)
* For each word of length $K$, sort its characters alphabetically (e.g. `"eat"` $\to$ `"aet"`). Use the sorted string as the Map key.
* **Time Complexity**: $O(N \cdot K \log K)$ where $N$ is number of strings, $K$ is maximum string length.
* **Space Complexity**: $O(N \cdot K)$.

#### Approach 2: 26-Element Frequency Tuple Key (Optimal $O(N \cdot K)$)
* Instead of sorting, count character occurrences using a fixed array of size 26.
* Convert the count array into a string key: `#1#0#0#0#1...`.
* Words with identical character frequencies produce identical string keys!
* **Time Complexity**: $O(N \cdot K)$ — Linear with respect to total input characters.
* **Space Complexity**: $O(N \cdot K)$.

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  const aCode = 'a'.charCodeAt(0);

  for (const s of strs) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
      count[s.charCodeAt(i) - aCode]++;
    }

    // Create unique delimiter-separated key: "#1#0#0...#1"
    const key = count.join('#');

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(s);
  }

  return Array.from(map.values());
}
```

---

### Problem 2: Top K Frequent Elements (LeetCode 347)
> **Problem Statement**: Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order. Your algorithm's time complexity must be better than $O(N \log N)$.

#### Approach 1: Hash Map + Full Sorting ($O(N \log N)$)
* Count frequencies in a Map, convert to array of pairs, sort descending by frequency.
* **Time Complexity**: $O(N \log N)$ (Fails interview requirement).

#### Approach 2: Hash Map + Min-Heap ($O(N \log K)$)
* Count frequencies in a Map. Maintain a Min-Heap of size $K$.
* For each element, push to heap. If heap size exceeds $K$, pop the minimum.
* **Time Complexity**: $O(N \log K)$ | **Space Complexity**: $O(N + K)$.

#### Approach 3: Bucket Sort by Frequency (Optimal $O(N)$ Time, $O(N)$ Space)
* **The Genius Insight**: An element can appear at most $N$ times.
* Create an array of buckets `buckets[frequency] = [elements]` where the **index represents the exact frequency**!
  * Index 1 stores elements that appear 1 time.
  * Index 2 stores elements that appear 2 times.
  * ...
  * Index $N$ stores elements that appear $N$ times.
* Scan the buckets from index $N$ down to 1 and collect elements until you have $K$ items!

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // Step 1: Count frequencies
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Step 2: Initialize buckets (index 0 to nums.length)
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);

  // Step 3: Populate buckets
  for (const [num, count] of freqMap.entries()) {
    buckets[count].push(num);
  }

  // Step 4: Traverse buckets from highest frequency to lowest
  const result: number[] = [];
  for (let freq = buckets.length - 1; freq >= 0 && result.length < k; freq--) {
    if (buckets[freq].length > 0) {
      for (const num of buckets[freq]) {
        result.push(num);
        if (result.length === k) break;
      }
    }
  }

  return result;
}
// Time Complexity: O(N) — Single pass counting + single pass bucket traversal!
// Space Complexity: O(N)
```

---

### Problem 3: Longest Consecutive Sequence (LeetCode 128)
> **Problem Statement**: Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in $O(N)$ time.

#### Optimal Solution: HashSet Sequence Start Filtering ($O(N)$ Time, $O(N)$ Space)
* **Intuition**:
  * Store all numbers in a `Set` for $O(1)$ existence checks.
  * For each number `num`, is it the **start of a sequence**?
    * Check if `num - 1` exists in the Set.
    * If `set.has(num - 1)`, then `num` is NOT the start! Skip it immediately!
    * If `!set.has(num - 1)`, `num` is the absolute start of a sequence! Count forward: `num + 1`, `num + 2`...
* **Why this is strictly $O(N)$**:
  * Every number is only part of one sequence loop. Non-starting numbers are checked in $O(1)$ and skipped.

```typescript
function longestConsecutive(nums: number[]): number {
  if (nums.length === 0) return 0;

  const numSet = new Set(nums);
  let longestStreak = 0;

  for (const num of numSet) {
    // Only start counting if 'num' is the beginning of a sequence
    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentStreak = 1;

      while (numSet.has(currentNum + 1)) {
        currentNum += 1;
        currentStreak += 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
    }
  }

  return longestStreak;
}
```
