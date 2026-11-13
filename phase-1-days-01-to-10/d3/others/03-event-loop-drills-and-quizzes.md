# Day 3: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 3 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In a fixed-size sliding window of length $K$, how does the window update in $O(1)$ constant time instead of $O(K)$?
   * *Answer*: Instead of summing all $K$ elements from scratch, you add the single new incoming element at index `i` and subtract the single outgoing element at index `i - k` from the existing `windowSum`.
2. **Frontend**: Why does React store hooks in a singly-linked list on the Fiber node rather than using a hash map keyed by hook name?
   * *Answer*: Storing as a linked list provides minimal memory overhead per component instance. Because JavaScript execution order within a function is deterministic, React relies strictly on call order (`hook.next`) to look up each hook's state across renders.
3. **Backend**: Which specific Node.js operations utilize the Libuv Thread Pool, and which operations do NOT?
   * *Answer*: Thread pool is used by: File system I/O (`fs`), cryptographic operations (`crypto`), data compression (`zlib`), and DNS lookups (`dns.lookup`). It is **NOT** used by network sockets / HTTP requests, which leverage kernel non-blocking mechanisms (`epoll` on Linux).
4. **DevOps**: What is the primary advantage of multi-stage Docker builds for TypeScript applications?
   * *Answer*: It separates the build environment (compilers, TypeScript, linters, devDependencies) from the runtime environment. The final production image contains only compiled JavaScript (`dist/`) and production `node_modules`, reducing image size by ~90% (from ~1.2GB to ~130MB) and significantly minimizing security vulnerabilities.
5. **AI**: What is a "Self-Healing AI Loop", and why is it better than simple blind retries?
   * *Answer*: A self-healing loop validates LLM output against a schema (e.g. Zod). If validation fails, it extracts the exact validation errors and feeds them back into the model's context for the next turn, allowing the model to correct its specific mistakes rather than repeating the same error.

---

## ⚡ Part 2: The Event Loop Code Tracing Challenge

Predict the exact console output order:

```javascript
const fs = require('fs');

console.log('START');

setTimeout(() => {
  console.log('TIMEOUT 1');
}, 0);

setImmediate(() => {
  console.log('IMMEDIATE 1');
});

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('TIMEOUT INSIDE I/O');
  }, 0);

  setImmediate(() => {
    console.log('IMMEDIATE INSIDE I/O');
  });

  process.nextTick(() => {
    console.log('NEXT TICK INSIDE I/O');
  });
});

process.nextTick(() => {
  console.log('NEXT TICK 1');
});

console.log('END');
```

### Step-by-Step Solution:
1. **Synchronous code**:
   * `console.log('START')` $\to$ **Prints: `START`**
   * Schedules `setTimeout(1)`, `setImmediate(1)`, and `fs.readFile`.
   * `process.nextTick(1)` pushed to microtask queue.
   * `console.log('END')` $\to$ **Prints: `END`**
2. **Drain Microtask Queue**:
   * `process.nextTick(1)` runs $\to$ **Prints: `NEXT TICK 1`**
3. **Event Loop Iteration 1**:
   * Timers / Check phase: `TIMEOUT 1` and `IMMEDIATE 1` run (order between these two in main context depends on system clock resolution).
4. **Inside `fs.readFile` Callback (Poll Phase)**:
   * NextTick queue has highest priority $\to$ **Prints: `NEXT TICK INSIDE I/O`**
   * The Poll phase finishes and moves directly to the **Check Phase (`setImmediate`)** $\to$ **Prints: `IMMEDIATE INSIDE I/O`**
   * The loop circles back to the **Timers Phase** on the next tick $\to$ **Prints: `TIMEOUT INSIDE I/O`**
