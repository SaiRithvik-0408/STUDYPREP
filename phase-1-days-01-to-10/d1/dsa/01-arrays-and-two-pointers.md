# Day 1: Data Structures & Algorithms (DSA)

---

## 1. Array Memory Mechanics & Physical Architecture

### 1.1 Contiguous Memory in Hardware
In physical RAM, memory consists of consecutively numbered byte addresses. When you create an array of fixed-size items (e.g. 4-byte integers) starting at memory address `0x1000`:
* Index 0: `0x1000`
* Index 1: `0x1004`
* Index 2: `0x1008`
* Index 3: `0x100C`

```
Memory Address: [ 0x1000 ]   [ 0x1004 ]   [ 0x1008 ]   [ 0x100C ]
Stored Value:   |   15   |   |   25   |   |   35   |   |   45   |
Array Index:        [0]          [1]          [2]          [3]
```

#### Why Index Lookup `arr[i]` is $O(1)$ Constant Time:
The CPU doesn't search through the array. It computes the physical address directly with one mathematical calculation:
$$\text{Memory Address} = \text{Base Address} + (\text{Index} \times \text{Size of Element})$$
For index 2: `0x1000 + (2 * 4) = 0x1008`. The CPU accesses it immediately.

#### Why `arr.unshift()` or `arr.splice()` is $O(N)$ Linear Time:
If you insert or delete an element at index 0, **every other element in the array must be shifted in physical memory by one slot**. With 1,000,000 items, that requires 1,000,000 memory moves.

### 1.2 V8 Engine Reality (JavaScript / TypeScript)
In JavaScript, arrays are not fixed-size C arrays. V8 optimizes them using two internal modes:
1. **Fast Elements**: Contiguous C++ memory buffers under the hood. As long as your array holds uniform data without index holes (`[1, 2, 3]`), operations are blazingly fast.
2. **Dictionary Elements**: If you create huge gaps (`arr[0] = 1; arr[50000] = 2;`), V8 de-optimizes the array into a hash table, significantly slowing down reads and writes.

---

## 2. The Two-Pointer Algorithmic Pattern

The Two-Pointer pattern eliminates nested loops by using two moving index variables. It typically reduces $O(N^2)$ brute-force solutions to $O(N)$ linear time and $O(1)$ auxiliary space.

```
Pattern 1: Converging Pointers (Opposite Ends)
  [ Left ─────────────►        ◄───────────── Right ]
  Used for: Sorted pair search, palindromes, container boundaries.

Pattern 2: Fast & Slow Pointers (Same Direction)
  [ Slow ──►    Fast ─────────────►                 ]
  Used for: In-place array modification, cycle detection.
```

---

## 3. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Two Sum II — Input Array Is Sorted (LeetCode 167)
> **Problem Statement**: Given a 1-indexed array of integers `numbers` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific `target` number. Return their 1-based indices `[index1, index2]`. You must use $O(1)$ extra space.

#### Approach 1: Brute Force (Check Every Pair)
* **Idea**: Use two nested loops to check every possible pair $(i, j)$.
* **Time Complexity**: $O(N^2)$ — For $N = 30,000$, iterations $\approx 4.5 \times 10^8$ (TLE).
* **Space Complexity**: $O(1)$ — No extra memory used.

```typescript
function twoSumBruteForce(numbers: number[], target: number): number[] {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] + numbers[j] === target) {
        return [i + 1, j + 1]; // 1-indexed
      }
    }
  }
  return [];
}
```

#### Approach 2: Binary Search (Better)
* **Idea**: For each element `numbers[i]`, the required second number is `complement = target - numbers[i]`. Since the array is sorted, perform Binary Search on the remaining subarray `[i + 1 ... N - 1]`.
* **Time Complexity**: $O(N \log N)$ — $N$ iterations, each running binary search in $O(\log N)$.
* **Space Complexity**: $O(1)$.

```typescript
function twoSumBinarySearch(numbers: number[], target: number): number[] {
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    let low = i + 1;
    let high = numbers.length - 1;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      if (numbers[mid] === complement) {
        return [i + 1, mid + 1];
      } else if (numbers[mid] < complement) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return [];
}
```

#### Approach 3: Two Pointers (Optimal)
* **Idea**:
  * Place `left` pointer at index 0 (smallest element).
  * Place `right` pointer at index `numbers.length - 1` (largest element).
  * Compute `sum = numbers[left] + numbers[right]`:
    * If `sum === target`: Solution found!
    * If `sum < target`: Because the array is sorted, the only way to increase the sum is to increment `left++`.
    * If `sum > target`: The only way to decrease the sum is to decrement `right--`.
* **Time Complexity**: $O(N)$ — Single pass; the pointers move towards each other at most $N$ times.
* **Space Complexity**: $O(1)$ — Only two integer pointer variables.

```typescript
function twoSumOptimal(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const currentSum = numbers[left] + numbers[right];

    if (currentSum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (currentSum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}
```

#### Dry-Run Table:
Input: `numbers = [2, 7, 11, 15]`, `target = 9`

| Step | `left` (Value) | `right` (Value) | `currentSum` | Condition | Pointer Adjustment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 0 (2) | 3 (15) | 17 | $17 > 9$ | `right--` |
| 2 | 0 (2) | 2 (11) | 13 | $13 > 9$ | `right--` |
| 3 | 0 (2) | 1 (7) | 9 | $9 === 9$ | **Found! Return `[1, 2]`** |

---

### Problem 2: Remove Duplicates from Sorted Array (LeetCode 26)
> **Problem Statement**: Given an integer array `nums` sorted in non-decreasing order, remove duplicates **in-place** such that each unique element appears only once. Return the number of unique elements $k$. The first $k$ elements of `nums` must hold the unique elements.

#### Approach 1: Extra Space (Set / Temporary Array)
* **Idea**: Insert into a `Set` to filter duplicates, then copy elements back to `nums`.
* **Flaw**: Violates the problem's strict $O(1)$ auxiliary memory requirement.
* **Time Complexity**: $O(N)$ | **Space Complexity**: $O(N)$ (Rejected in interview).

#### Approach 2: Array Splice (Brute Force In-Place)
* **Idea**: Loop through array, if `nums[i] === nums[i - 1]`, call `nums.splice(i, 1)`.
* **Flaw**: Every `splice()` call shifts all remaining elements left in memory by 1 slot ($O(N)$ work). Inside a loop, this degrades to $O(N^2)$.
* **Time Complexity**: $O(N^2)$ | **Space Complexity**: $O(1)$.

#### Approach 3: Two Pointers (Writer & Reader) (Optimal)
* **Idea**:
  * Pointer 1: `writeIndex` (The Writer) — Marks the slot where the next unique number should be written. Starts at `1` (index 0 is always unique).
  * Pointer 2: `readIndex` (The Reader) — Scans forward from index `1` to `nums.length - 1`.
  * If `nums[readIndex] !== nums[readIndex - 1]`, we have encountered a new unique value. Write `nums[writeIndex] = nums[readIndex]` and increment `writeIndex++`.
* **Time Complexity**: $O(N)$ — Single scan through array.
* **Space Complexity**: $O(1)$ — In-place mutation.

```typescript
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let writeIndex = 1;

  for (let readIndex = 1; readIndex < nums.length; readIndex++) {
    if (nums[readIndex] !== nums[readIndex - 1]) {
      nums[writeIndex] = nums[readIndex];
      writeIndex++;
    }
  }

  return writeIndex;
}
```

#### Step-by-Step State Evolution:
Input: `nums = [0, 0, 1, 1, 2]`

```
Initial:      [ 0,  0,  1,  1,  2 ]  writeIndex=1, readIndex=1 -> nums[1] === nums[0] (Duplicate, skip)
readIndex=2:  [ 0,  1,  1,  1,  2 ]  nums[2] !== nums[1] -> nums[1] = nums[2], writeIndex becomes 2
readIndex=3:  [ 0,  1,  1,  1,  2 ]  nums[3] === nums[2] (Duplicate, skip)
readIndex=4:  [ 0,  1,  2,  1,  2 ]  nums[4] !== nums[3] -> nums[2] = nums[4], writeIndex becomes 3
Result: k = 3, unique subarray = [0, 1, 2]
```

---

### Problem 3: Move Zeroes (LeetCode 283)
> **Problem Statement**: Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without copying the array.

#### Approach 1: Extra Buffer Array
* **Idea**: Create a new array, copy all non-zero elements into it, pad remaining slots with zeroes.
* **Flaw**: Violates the $O(1)$ space requirement.
* **Time Complexity**: $O(N)$ | **Space Complexity**: $O(N)$.

#### Approach 2: In-Place Swap with Fast & Slow Pointers (Optimal)
* **Idea**:
  * Pointer `slow`: Points to the index where the next non-zero element should be placed.
  * Pointer `fast`: Scans the array searching for non-zero numbers.
  * Whenever `nums[fast] !== 0`, swap `nums[slow]` and `nums[fast]`, then increment `slow++`.
* **Time Complexity**: $O(N)$ — Single pass.
* **Space Complexity**: $O(1)$ — Zero additional memory.

```typescript
function moveZeroes(nums: number[]): void {
  let slow = 0;

  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      if (slow !== fast) {
        // Swap elements
        const temp = nums[slow];
        nums[slow] = nums[fast];
        nums[fast] = temp;
      }
      slow++;
    }
  }
}
```

---

### Problem 4: Valid Palindrome (LeetCode 125)
> **Problem Statement**: A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return `true` if it is a palindrome, or `false` otherwise.

#### Approach 1: Filter, Reverse & Compare
* **Idea**: Clean string with regex `/[^a-z0-9]/gi`, convert to lowercase, reverse with `.split('').reverse().join('')`, and compare.
* **Time Complexity**: $O(N)$
* **Space Complexity**: $O(N)$ — Allocates 3 new string and array buffers in memory.

#### Approach 2: Converging Two Pointers In-Place (Optimal)
* **Idea**:
  * `left = 0`, `right = s.length - 1`.
  * While `left < right`:
    * If `s[left]` is not alphanumeric, skip `left++`.
    * If `s[right]` is not alphanumeric, skip `right--`.
    * Compare lowercase characters. If different, return `false`.
    * Otherwise, `left++` and `right--`.
* **Time Complexity**: $O(N)$ — Single pass.
* **Space Complexity**: $O(1)$ — No new strings or arrays allocated.

```typescript
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;

  function isAlphanumeric(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 48 && code <= 57) ||  // 0-9
      (code >= 65 && code <= 90) ||  // A-Z
      (code >= 97 && code <= 122)    // a-z
    );
  }

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) {
      left++;
    }
    while (left < right && !isAlphanumeric(s[right])) {
      right--;
    }

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}
```
