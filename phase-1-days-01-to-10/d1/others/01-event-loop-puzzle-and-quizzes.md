# Day 1: Drills, Quizzes & Practical Exercises

To complete Day 1, review these practical drills and solve the execution puzzle.

---

## 🧠 Part 1: The Event Loop & Promise Execution Puzzle

### The Code:
Predict the exact console output order:

```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
}, 0);

new Promise((resolve) => {
  console.log('C');
  resolve();
}).then(() => {
  console.log('D');
});

console.log('E');
```

---

### Step-by-Step Execution Breakdown:

1. **Line 1 (`console.log('A')`)**:
   * Evaluated synchronously on the Call Stack.
   * **Output: `A`**

2. **Line 3 (`setTimeout(..., 0)`)**:
   * Registered with `libuv` / Node background timer subsystem.
   * Its callback `() => console.log('B')` is placed in the **Macrotask (Timers) Queue**.
   * Call Stack continues immediately without waiting.

3. **Line 7 (`new Promise(executor)`) — THE INTERVIEW TRAP**:
   * **The function passed to `new Promise((resolve) => { ... })` runs SYNCHRONOUSLY!** It is not deferred!
   * `console.log('C')` executes immediately on the Call Stack.
   * **Output: `C`**
   * `resolve()` is called. This marks the promise as fulfilled and places its `.then()` callback `() => console.log('D')` into the **Microtask Queue**.

4. **Line 14 (`console.log('E')`)**:
   * Evaluated synchronously on the Call Stack.
   * **Output: `E`**

5. **Call Stack is now empty**:
   * The Event Loop inspects the **Microtask Queue** first before checking any Macrotasks.
   * It finds `() => console.log('D')`.
   * Pushes to Call Stack and executes.
   * **Output: `D`**

6. **Microtask Queue is now empty**:
   * The Event Loop checks the **Macrotask Queue**.
   * It finds `() => console.log('B')`.
   * Pushes to Call Stack and executes.
   * **Output: `B`**

### Final Correct Sequence:
$$\mathbf{A \longrightarrow C \longrightarrow E \longrightarrow D \longrightarrow B}$$

---

## 📝 Part 2: Day 1 Concept Verification Questions

Answer these 5 questions in your notes:

1. **DSA**: Why does `Array.prototype.unshift()` in JavaScript have a time complexity of $O(N)$, whereas `arr[i]` is $O(1)$?
   * *Answer*: Arrays occupy contiguous memory. Accessing by index uses a direct mathematical offset $O(1)$. Unshifting inserts an element at index 0, requiring every existing element to be physically shifted right by one memory address ($O(N)$).
2. **Backend**: What is the Temporal Dead Zone (TDZ), and why does `var` evaluate to `undefined` while `let` throws a `ReferenceError`?
   * *Answer*: Both are hoisted in memory during the Creation Phase. However, `var` is initialized to `undefined`, whereas `let` and `const` remain uninitialized. Accessing an uninitialized variable in the TDZ throws a `ReferenceError` to catch runtime bugs.
3. **Frontend**: Why does using array index as a `key` (`key={index}`) in React lists cause severe bugs when items are deleted or reordered?
   * *Answer*: React uses keys to match virtual DOM nodes between renders. If item 0 is deleted, item 1 becomes index 0. React matches it with the old key 0, reuses the old DOM node, and preserves the old node's internal state (e.g. input text or checkbox status) on the wrong data item.
4. **DevOps**: What is the difference between a Linux Namespace and a Cgroup in Docker?
   * *Answer*: Namespaces control **what a container can see** (isolating processes, network ports, mounts). Cgroups control **how many resources a container can use** (throttling maximum RAM, CPU, and disk I/O).
5. **AI**: Why are LLM output tokens significantly more expensive and slower to generate than input tokens?
   * *Answer*: Input tokens are processed in parallel across GPU matrix cores in a single pass. Output tokens must be generated **auto-regressively** (one token at a time), where each generated token is fed back into the model to predict the next token.

---

## 💻 Part 3: Hands-On Homework Task

Write a TypeScript file that implements the **Two Sum II (Sorted)** function using Two Pointers:
* Given `numbers = [1, 3, 4, 5, 7, 11]`, `target = 9`.
* Return the 1-based indices of the two numbers that add up to 9 (`[3, 4]`).
* Run it with Node.js / `tsx` and confirm it works without extra memory ($O(1)$ space).
