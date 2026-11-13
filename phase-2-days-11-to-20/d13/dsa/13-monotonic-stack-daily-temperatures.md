# Day 13: Data Structures & Algorithms (DSA)

---

## 1. The Monotonic Stack Paradigm

A **Monotonic Stack** is a stack where elements are strictly increasing or strictly decreasing. It is used to find the **Next Greater Element** or **Previous Smaller Element** for every item in $O(N)$ linear time instead of $O(N^2)$ nested loops.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Daily Temperatures (LeetCode 739)
> **Problem Statement**: Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0`.

#### Optimal Solution: Monotonically Decreasing Stack ($O(N)$ Time, $O(N)$ Space)
```typescript
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const result: number[] = new Array(n).fill(0);
  // Stack stores indices of temperatures in strictly decreasing order
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    const currentTemp = temperatures[i];

    // While current temperature is WARMER than temperature at stack top
    while (stack.length > 0 && currentTemp > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      result[prevIndex] = i - prevIndex; // Days waited
    }

    stack.push(i);
  }

  return result;
}
```

---

### Problem 2: Next Greater Element I (LeetCode 496)
```typescript
function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
  const nextGreaterMap = new Map<number, number>();
  const stack: number[] = [];

  for (const num of nums2) {
    while (stack.length > 0 && num > stack[stack.length - 1]) {
      nextGreaterMap.set(stack.pop()!, num);
    }
    stack.push(num);
  }

  return nums1.map((num) => nextGreaterMap.get(num) ?? -1);
}
```