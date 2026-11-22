# Day 1: High-Yield Drills, System Traps & Practical Exercises

Welcome to the Day 1 Drills module. These drills are designed to simulate senior technical interview deep-dives, tricky production debugging scenarios, and core systems reasoning across V8, the React render cycle, Linux container mechanics, and LLM structured decoding.

---

## ⚡ Master Drill 1: The Event Loop & Asynchronous Execution Trace

### The Interview Challenge
Predict the **exact** console output order of the following JavaScript / Node.js program:

```javascript
console.log('1: Synchronous Start');

setTimeout(() => {
  console.log('2: Macrotask Timeout (0ms)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask Promise 1');
}).then(() => {
  console.log('4: Microtask Promise 2');
});

queueMicrotask(() => {
  console.log('5: Explicit queueMicrotask');
});

new Promise((resolve) => {
  console.log('6: Promise Executor');
  resolve();
}).then(() => {
  console.log('7: Promise Executor .then');
});

console.log('8: Synchronous End');
```

---

### Step-by-Step Architectural Execution Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CALL STACK (Synchronous)                      │
│ Line 1: '1: Synchronous Start'                                         │
│ Line 3: Register setTimeout (0ms) -> Dispatched to Timers Subsystem    │
│ Line 7: Promise.resolve() -> enqueues Callback 3 to Microtask Queue    │
│ Line 13: queueMicrotask() -> enqueues Callback 5 to Microtask Queue    │
│ Line 17: new Promise(executor) RUNS SYNCHRONOUSLY! -> '6: Executor'    │
│          resolve() -> enqueues Callback 7 to Microtask Queue           │
│ Line 23: '8: Synchronous End'                                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Call Stack becomes EMPTY
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MICROTASK QUEUE (High Priority)                 │
│ 1. [Promise 1] -> prints '3: Microtask Promise 1', returns undefined   │
│    -> enqueues Callback 4 ('4: Microtask Promise 2') at end of queue   │
│ 2. [queueMicrotask] -> prints '5: Explicit queueMicrotask'             │
│ 3. [Executor .then] -> prints '7: Promise Executor .then'              │
│ 4. [Promise 2] -> prints '4: Microtask Promise 2'                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Microtask Queue is completely DRAINED
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     MACROTASK QUEUE (Timers Phase)                     │
│ 1. [setTimeout 0ms] -> pops to Call Stack -> prints '2: Macrotask...'  │
└────────────────────────────────────────────────────────────────────────┘
```

#### The Golden Rules of the Event Loop:
1. **Promise Executors are Synchronous**: The callback function passed to `new Promise((resolve, reject) => { ... })` executes **immediately on the Call Stack**. It is never deferred!
2. **Microtasks Preempt Macrotasks**: Microtasks (`Promise.then()`, `Promise.catch()`, `Promise.finally()`, `queueMicrotask`, `process.nextTick` in Node) have absolute priority over Macrotasks (`setTimeout`, `setInterval`, `setImmediate`, I/O events).
3. **Queue Draining Guarantee**: The Event Loop **must drain the entire Microtask Queue until it is completely empty** before it picks up the next Macrotask. Any new microtasks queued during microtask execution run in the *same* turn!

#### Final Output Sequence:
$$\mathbf{1 \longrightarrow 6 \longrightarrow 8 \longrightarrow 3 \longrightarrow 5 \longrightarrow 7 \longrightarrow 4 \longrightarrow 2}$$

---

## 🧠 Master Drill 2: V8 Memory, Hoisting & Temporal Dead Zone (TDZ) Traps

### Trap 2.1: The TDZ Variable Shadowing Trap
What does this code output in Node.js or Chrome DevTools?

```javascript
let count = 50;

function printCount() {
  console.log(count);
  let count = 100;
}

printCount();
```

* **Answer**: It throws `ReferenceError: Cannot access 'count' before initialization`!
* **Why**: The inner `let count = 100` hoists to the top of `printCount`'s Function Execution Context during the **Creation Phase**. Because `let` creates a block-scoped binding, it shadows the outer `count = 50`. From the start of the function body until line `let count = 100`, the inner variable is in the **Temporal Dead Zone (TDZ)**. Any read or write access throws a `ReferenceError`.

### Trap 2.2: Memory Leak via Unintended Closures
Explain why the following pattern causes a heap memory leak in Node.js backend servers:

```javascript
let leakyCache;

function runWorker() {
  const previousCache = leakyCache;
  const largeMemoryBuffer = new Array(10_000_000).fill('🚀');

  leakyCache = {
    method: function() {
      if (previousCache) console.log("Retaining reference!");
    }
  };
}

setInterval(runWorker, 100);
```

* **The Mechanism**: In V8, all closures created inside the same function execution context share the same Lexical Environment object on the heap. Even though `method` does not directly use `largeMemoryBuffer`, it retains `previousCache`, which in turn retains its lexical environment containing the previous `largeMemoryBuffer`. This creates an unbroken reference chain preventing V8's Scavenger and Mark-Sweep GC from reclaiming the memory, causing an Out-Of-Memory (`heap out of memory`) crash!

---

## 🎨 Master Drill 3: React 18/19 Fiber & Reconciliation Traps

### Trap 3.1: The Index-as-Key State Corruption Bug
Consider this React component that renders a list of items with text inputs:

```tsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 't1', text: 'Master V8 Internals' },
    { id: 't2', text: 'Master React Fiber' },
    { id: 't3', text: 'Build Multi-Agent LLMs' }
  ]);

  const deleteFirst = () => setTodos(todos.slice(1));

  return (
    <div>
      <button onClick={deleteFirst}>Delete First</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <span>{todo.text}</span>
            <input type="text" placeholder="Add personal note..." />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### What happens if the user types a note into the FIRST input ("Priority 1") and clicks "Delete First"?
* **The Bug**: The item text changes from *"Master V8 Internals"* to *"Master React Fiber"*, but the typed text *"Priority 1"* **remains on the new first row**!
* **Architectural Reason**:
  - React's Fiber reconciler uses the `key` to correlate Virtual DOM nodes between renders.
  - When `todos[0]` is deleted, the array now has 2 elements at indices `0` and `1`.
  - React compares the new element with `key=0` to the old element with `key=0`.
  - Because `type` (`li`) and `key` (`0`) match, React reuses the existing DOM `<li>` and `<input>` nodes!
  - It patches the `<span>` text to the new string, but **leaves the uncontrolled `<input>` DOM node intact with its existing typed value**!
* **The Fix**: Always use persistent, unique entity IDs (`key={todo.id}`).

---

## 🐳 Master Drill 4: Linux Kernel Namespaces & Cgroups Debugging

### Production Scenario: Exit Code 137
A Node.js backend container deployed on Kubernetes or Docker suddenly restarts every 10 minutes with exit code `137`.

1. **What is Exit Code 137?**
   - $137 = 128 + 9$, meaning the process was terminated by Linux signal **SIGKILL (`kill -9`)**.
   - Specifically, this was triggered by the Linux kernel's **Out-Of-Memory (OOM) Killer**.
2. **How does Cgroups enforce this?**
   - When you set `--memory 512m` in Docker, the Docker daemon configures the Linux Cgroup interface file `/sys/fs/cgroup/memory/memory.limit_in_bytes` (or `memory.max` in cgroups v2).
   - If the Node.js process attempts to allocate memory exceeding 512 MB, the kernel immediately halts allocation and executes `oom_kill_process()`, terminating the highest memory consumer with SIGKILL.
3. **How do you diagnose and fix it?**
   - Check kernel ring buffer on the host: `dmesg -T | grep -i oom`.
   - In Node.js: Inspect heap usage via `--max-old-space-size` and look for unbounded in-memory caches, large file stream buffers, or memory leaks.

---

## 🤖 Master Drill 5: LLM Tokenization & Cost Asymmetry Analysis

### Scenario: High-Volume Production Triage
Your team is deploying an AI triage service processing 50,000 customer tickets per day.
* Average Prompt (System + Ticket): **1,200 input tokens**.
* Average Extraction (JSON response): **300 output tokens**.
* Pricing: **\$0.50 / 1M input tokens**, **\$1.50 / 1M output tokens**.

### Calculations:
1. **Daily Input Cost**:
   $$50,000 \times 1,200 = 60,000,000 \text{ tokens} = 60 \times \$0.50 = \mathbf{\$30.00 / \text{day}}$$
2. **Daily Output Cost**:
   $$50,000 \times 300 = 15,000,000 \text{ tokens} = 15 \times \$1.50 = \mathbf{\$22.50 / \text{day}}$$
3. **Latency Bottleneck**:
   - The 1,200 input tokens are processed in a single parallel GPU forward pass (prefill time $\approx 15\text{ms}$).
   - The 300 output tokens must be generated auto-regressively at $\approx 25\text{ms/token} \times 300 = 7,500\text{ms}$ ($7.5$ seconds!).
   - **Optimization Takeaway**: To optimize latency and throughput, strictly minimize output tokens by compressing the required JSON schema keys (e.g. enum codes instead of verbose sentences).

---

## 💻 Master Drill 6: Algorithmic Pointer Manipulation (Hands-On)

### Challenge: In-Place Zeros Movement
Given an integer array `nums`, move all `0`s to the end while maintaining the relative order of the non-zero elements. You must do this **in-place without copying the array** in $O(N)$ time and $O(1)$ extra space.

```typescript
function moveZeroes(nums: number[]): void {
  let writer = 0; // Points to the index where the next non-zero should be written

  // Fast reader pointer scans the array
  for (let reader = 0; reader < nums.length; reader++) {
    if (nums[reader] !== 0) {
      if (reader !== writer) {
        // Swap non-zero element with the zero at writer
        const temp = nums[writer];
        nums[writer] = nums[reader];
        nums[reader] = temp;
      }
      writer++;
    }
  }
}
```

* **Loop Invariant**: At the beginning of each iteration `reader`, all elements in `nums[0 ... writer-1]` are guaranteed non-zero and in their original relative order; all elements in `nums[writer ... reader-1]` are zeros.
* **Complexity**: Exactly 1 pass over the array ($O(N)$ time), zero auxiliary memory ($O(1)$ space).

---

## 📋 Day 1 Drill Self-Assessment Checklist
- [ ] Successfully traced the 8-step Event Loop execution order.
- [ ] Explained why Promise executors are synchronous and `.then()` callbacks are microtasks.
- [ ] Identified the Temporal Dead Zone (TDZ) and lexical shadowing error in V8.
- [ ] Explained why using `key={index}` causes uncontrolled DOM input state retention.
- [ ] Explained Linux Cgroups memory limits and SIGKILL exit code 137.
- [ ] Calculated token cost and explained GPU prefill vs auto-regressive decoding latency asymmetry.
- [ ] Implemented the two-pointer in-place array partition without auxiliary arrays.
