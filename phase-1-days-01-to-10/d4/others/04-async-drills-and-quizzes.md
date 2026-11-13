# Day 4: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 4 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In the "Longest Substring Without Repeating Characters" problem, how does storing the last-seen index of each character in a Map optimize the `left` pointer movement?
   * *Answer*: Instead of incrementing `left` one-by-one with a while-loop and deleting characters from a Set ($O(2N)$), the map allows `left` to jump directly to `lastSeenIndex + 1` in $O(1)$ constant time, ensuring a strict single pass ($O(N)$).
2. **Backend**: What is the core difference between `Promise.all` and `Promise.allSettled`? When must you prefer `Promise.allSettled`?
   * *Answer*: `Promise.all` fails fast and rejects immediately if any single promise fails, discarding results of all other promises. `Promise.allSettled` waits for all promises to settle regardless of outcome and returns their individual statuses (`fulfilled` or `rejected`). Use `Promise.allSettled` when tasks are independent (e.g. sending emails to multiple users) and partial success is acceptable.
3. **Frontend**: Why does wrapping a child component in `React.memo` fail to prevent re-renders if the parent passes an unmemoized arrow function as an `onClick` prop?
   * *Answer*: On every parent re-render, JavaScript allocates a brand new function object in memory with a new reference address. `React.memo` performs shallow equality (`Object.is`) on props; since the function reference address changed, it concludes the props changed and triggers a re-render. You must wrap the callback in `useCallback`.
4. **DevOps**: What is the difference between a Docker Named Volume and a Bind Mount?
   * *Answer*: Named Volumes are stored in Docker's managed storage directory (`/var/lib/docker/volumes/`), isolated from host OS clutter, and designed for persistent databases. Bind Mounts map a specific host file/directory (like `./src`) directly into the container and are used for local development code hot-reloading.
5. **AI**: In LLM Function Calling, does the language model execute the backend function itself?
   * *Answer*: No. The LLM never executes code directly. It inspects declared tool schemas and outputs structured JSON containing the tool name and arguments. Your backend server parses the arguments, executes the real function locally, and feeds the output back to the LLM.

---

## ⚡ Part 2: Async / Await Execution Order Puzzle

Predict the exact console output order:

```javascript
async function async1() {
  console.log('1');
  await async2();
  console.log('2');
}

async function async2() {
  console.log('3');
}

console.log('4');

setTimeout(() => {
  console.log('5');
}, 0);

async1();

new Promise((resolve) => {
  console.log('6');
  resolve();
}).then(() => {
  console.log('7');
});

console.log('8');
```

### Step-by-Step Solution:
1. `console.log('4')` $\to$ Synchronous $\to$ **Prints: `4`**
2. `setTimeout(..., 0)` scheduled in Macrotask Timers Queue.
3. `async1()` called:
   * `console.log('1')` $\to$ Synchronous $\to$ **Prints: `1`**
   * Calls `async2()`:
     * `console.log('3')` $\to$ Synchronous $\to$ **Prints: `3`**
   * `await` pauses `async1()`, converts remaining code to a microtask, and yields control back to Call Stack.
4. `new Promise(executor)`:
   * Executor runs synchronously $\to$ `console.log('6')` $\to$ **Prints: `6`**
   * `resolve()` pushes `.then()` to Microtask Queue.
5. `console.log('8')` $\to$ Synchronous $\to$ **Prints: `8`**
6. Call Stack empty $\to$ Drain Microtasks:
   * `async1` resumption (`console.log('2')`) $\to$ **Prints: `2`**
   * Promise `.then` (`console.log('7')`) $\to$ **Prints: `7`**
7. Microtasks empty $\to$ Run Macrotask:
   * `setTimeout` callback (`console.log('5')`) $\to$ **Prints: `5`**

### Output:
$$\mathbf{4 \to 1 \to 3 \to 6 \to 8 \to 2 \to 7 \to 5}$$
