# Day 1: Backend Engineering & JavaScript Engine Internals

To build resilient backend services with Node.js and answer senior interview questions, you must master how the **Google V8 Engine** executes code, manages memory, and handles variables.

---

## 1. How V8 Executes Your Code

V8 is Google's open-source high-performance JavaScript and WebAssembly engine written in C++. It powers Google Chrome and Node.js.

```
Source Code
    │
    ▼
[ Parser & Scanner ] ──► Abstract Syntax Tree (AST)
    │
    ▼
[ Ignition Interpreter ] ──► Bytecode (Fast startup)
    │
    ▼ (Profiling: Monitor hot functions)
[ TurboFan Compiler ] ──► Highly Optimized Machine Code (Native CPU speed)
    │
    ▲ (Bailout / De-optimization if assumptions fail)
```

### The Optimization Pipeline:
1. **Ignition (Interpreter)**: Generates bytecode quickly so the application boots without waiting for full machine compilation.
2. **TurboFan (JIT Compiler)**: Observes which functions are executed repeatedly ("hot functions"). It makes speculative optimizations (e.g. *"this function always receives two 32-bit integers"*) and compiles them directly into native assembly language.
3. **De-optimization Trap**: If you write polymorphic code (e.g. passing a string to a function that previously only processed numbers), TurboFan's speculation fails. It bails out, discards the machine code, and drops back to interpreted bytecode.
   * **Takeaway for Backend**: Keep function signatures and object schemas strictly uniform (TypeScript helps enforce this).

---

## 2. The Execution Context Architecture

Whenever JavaScript runs, it runs inside an **Execution Context**.

```
┌────────────────────────────────────────────────────────┐
│                   EXECUTION CONTEXT                    │
├────────────────────────────┬───────────────────────────┤
│ Phase 1: Memory Creation   │ Phase 2: Code Execution   │
├────────────────────────────┼───────────────────────────┤
│ - Reads all declarations   │ - Runs line by line       │
│ - Allocates memory         │ - Assigns actual values   │
│ - Sets up Scope Chain      │ - Executes function calls │
│ - Determines `this`        │ - Evaluates expressions   │
└────────────────────────────┴───────────────────────────┘
```

* **Global Execution Context (GEC)**: Created once when the Node.js process starts. Sets up `global` and `this`.
* **Function Execution Context (FEC)**: Created dynamically on the Call Stack whenever a function is called.

---

## 3. Hoisting & The Temporal Dead Zone (TDZ)

**Hoisting** is the engine's behavior of scanning the script during **Phase 1 (Creation Phase)** and reserving memory for declarations before executing a single line of code.

### Memory Allocation Matrix:

| Declaration Type | Hoisted in Phase 1? | Initial Value in Memory | Accessing Before Declaration Line |
| :--- | :--- | :--- | :--- |
| `function foo() {}` | **Yes** | Complete Function Object | **Allowed** (Executes normally) |
| `var score` | **Yes** | `undefined` | **Allowed** (Returns `undefined`) |
| `let score` | **Yes** | `<uninitialized>` | **Throws `ReferenceError` (TDZ)** |
| `const score` | **Yes** | `<uninitialized>` | **Throws `ReferenceError` (TDZ)** |

### What is the Temporal Dead Zone (TDZ)?
The TDZ is the temporal region between the start of a block's scope and the explicit declaration line where `let` or `const` is initialized.

```javascript
{
  // === START OF SCOPE ===
  // 'port' is allocated in memory but marked as <uninitialized>.
  // This is the TEMPORAL DEAD ZONE.

  // console.log(port); // ❌ Throws ReferenceError: Cannot access 'port' before initialization

  const appName = "AuthService"; // Initialized!
  console.log(appName); // "AuthService"

  // === END OF TDZ for 'port' ===
  let port = 8080; // Initialized here!
  console.log(port); // 8080 (Safe to access)
}
```

### Why Did TC39 Introduce TDZ?
1. **Catching Latent Bugs**: Accessing variables before initialization is almost always an accidental bug. `var` silently returning `undefined` caused catastrophic bugs in production.
2. **`const` Invariance**: If `const x` was initialized to `undefined` during hoisting and then reassigned to its true value during execution, it would violate the core language guarantee that `const` can never be reassigned.

---

## 4. Closures & Heap Memory Allocation

A **closure** is the combination of a function bundled together with references to its surrounding lexical environment.

### The Interview Question:
*"When an outer function finishes running, its stack frame is popped off the Call Stack. Why don't the variables inside the closure get deleted by Garbage Collection?"*

### The Engine Mechanics:
1. When V8 compiles an outer function, it analyzes inner functions.
2. If an inner function references a variable from the outer scope, V8 knows this variable will outlive the Call Stack.
3. Instead of allocating the variable on the Call Stack, V8 allocates it in **Heap Memory** inside a special internal object called `[[Scopes]]`.
4. As long as the returned inner function exists, a reference pointer points to that Heap object, preventing the Garbage Collector from freeing it.

```
Call Stack (Ephemeral):               Heap Memory (Persistent):
┌─────────────────────────┐           ┌────────────────────────────────────┐
│ [outerFunction()]       │ ──exits─► │ Closure (Lexical Scope Object):    │
└─────────────────────────┘           │   secretToken = "xyz123"           │
                                      └────────────────────────────────────┘
                                                         ▲
                                                         │ (Reference retained)
                                      const innerFn = function() { ... }
```

### Production Example: High-Performance Token Bucket Rate Limiter
```typescript
interface RateLimiter {
  isAllowed(): boolean;
  getRemainingTokens(): number;
}

export function createTokenBucket(capacity: number, refillRatePerSecond: number): RateLimiter {
  // Encapsulated in Lexical Scope on the Heap
  let tokens = capacity;
  let lastRefillTimestamp = Date.now();

  return {
    isAllowed(): boolean {
      const now = Date.now();
      const elapsedSeconds = (now - lastRefillTimestamp) / 1000;

      // Refill tokens based on elapsed time
      tokens = Math.min(capacity, tokens + elapsedSeconds * refillRatePerSecond);
      lastRefillTimestamp = now;

      if (tokens >= 1) {
        tokens -= 1;
        return true;
      }

      return false; // Rate limit exceeded
    },

    getRemainingTokens(): number {
      return Math.floor(tokens);
    }
  };
}

// Usage:
const apiLimiter = createTokenBucket(5, 1); // Max 5 tokens, refills 1 token/sec
console.log(apiLimiter.isAllowed()); // true
console.log(apiLimiter.getRemainingTokens()); // 4
```

---

## 5. Senior Backend Interview Questions

### Q1: What is the output of this code?
```javascript
var x = 10;
function test() {
  console.log(x);
  var x = 20;
}
test();
```
* **Answer**: `undefined`.
* **Reason**: Inside `test()`, the local `var x` is hoisted to the top of the function scope and initialized to `undefined`. It shadows the outer `x = 10`. When `console.log(x)` runs, it prints the local `undefined` before `x = 20` executes.

### Q2: What is the difference between Call Stack and Memory Heap?
* **Call Stack**: Fixed-size contiguous memory used for thread execution, tracking function calls, and storing primitive values (`number`, `boolean`, `null`, pointers). Extremely fast (LIFO).
* **Memory Heap**: Large, unorganized block of memory used for storing dynamic reference types (`objects`, `arrays`, `functions`, `closures`). Garbage-collected automatically.
