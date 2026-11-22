# Day 12: Data Structures & Algorithms (DSA)

---

## 1. Stack & Queue Mechanics

* **Stack (LIFO)**: Pushing and popping occur exclusively at the top in $O(1)$.
* **Queue (FIFO)**: Elements are enqueued at the tail and dequeued from the head in $O(1)$.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Valid Parentheses (LeetCode 20)
> **Problem Statement**: Given a string `s` containing brackets, determine if the input string is valid.

#### Optimal Solution: Stack with Complement Matching ($O(N)$ Time, $O(N)$ Space)
```typescript
function isValid(s: string): boolean {
  if (s.length % 2 !== 0) return false;

  const stack: string[] = [];
  const bracketMap: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '[',
  };

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char in bracketMap) {
      const top = stack.length > 0 ? stack.pop() : '#';
      if (top !== bracketMap[char]) return false;
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}
```

---

### Problem 2: Min Stack (LeetCode 155)
> **Problem Statement**: Design a stack that supports push, pop, top, and retrieving the minimum element in $O(1)$ constant time.

#### Optimal Solution: Synchronized Min Stack ($O(1)$ Time)
```typescript
class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const currentMin = this.minStack.length === 0 
      ? val 
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(currentMin);
  }

  pop(): void {
    this.stack.pop();
    this.minStack.pop();
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}
```