# Day 3: Backend Engineering & The Event Loop Under the Hood

The single most common interview topic for Node.js developers is **The Event Loop and Libuv**. You must be able to explain how single-threaded JavaScript handles high concurrency without blocking.

---

## 1. The Architecture of Asynchronous Node.js

Node.js is not pure JavaScript. It is a runtime that binds **Google V8** with **Libuv** (a C-library written specifically for Node.js).

```
┌────────────────────────────────────────────────────────┐
│                      V8 ENGINE                         │
│   ┌─────────────────────┐      ┌──────────────────┐    │
│   │     Memory Heap     │      │    Call Stack    │    │
│   │ (Stores objects)    │      │ (Executes JS)    │    │
│   └─────────────────────┘      └──────────────────┘    │
└──────────────────────────────────────────┬─────────────┘
                                           │
                       Native C++ Bindings │ Non-blocking calls
                                           ▼
┌────────────────────────────────────────────────────────┐
│                        LIBUV                           │
│   ┌────────────────────────────────────────────────┐   │
│   │            Thread Pool (4-128 Threads)         │   │
│   │   (File I/O, Crypto, Zlib, DNS lookups)        │   │
│   └────────────────────────────────────────────────┘   │
│   ┌────────────────────────────────────────────────┐   │
│   │                The Event Loop                  │   │
│   │        (Orchestrates asynchronous tasks)       │   │
│   └────────────────────────────────────────────────┘   │
│   ┌────────────────────────────────────────────────┐   │
│   │          OS Kernel Demultiplexer               │   │
│   │           (Linux: epoll, Mac: kqueue)          │   │
│   │   * Handles Network Sockets without threads!   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Priority Hierarchy: Microtasks vs Macrotasks

In modern Node.js, asynchronous operations do not share equal priority.

```
TIER 1: Synchronous Call Stack (Always executes to completion first)
  │
  ▼ (When Stack is empty)
TIER 2: Microtask Queue (MUST be drained completely before any macrotask runs)
  ├── 1. process.nextTick (Node.js highest priority: executes before all other microtasks)
  └── 2. Promise callbacks (.then, .catch, .finally, await resumption), queueMicrotask
  │
  ▼ (When Microtask Queue is completely empty)
TIER 3: Macrotask Phases (Executes one phase at a time, checking microtasks between each)
  ├── 1. Timers: setTimeout, setInterval
  ├── 2. Pending Callbacks: System I/O errors (e.g. ECONNREFUSED)
  ├── 3. Poll: Retrieves new I/O events (HTTP requests, file reads)
  ├── 4. Check: setImmediate() callbacks
  └── 5. Close Callbacks: socket.on('close')
```

> **Crucial Rule**: The Event Loop **drains the entire Microtask Queue between every phase and between every single callback execution**.

---

## 3. The Libuv Thread Pool vs OS Async I/O

A common misconception is that Node.js uses threads for everything asynchronous.

### What uses the Libuv Thread Pool?
* **File System Operations (`fs.*`)**: Operating systems have poor cross-platform asynchronous filesystem APIs. Libuv uses its internal thread pool.
* **Crypto Operations (`crypto.pbkdf2`, `crypto.scrypt`)**: Heavy CPU math offloaded to background threads.
* **Compression (`zlib.*`)**
* **DNS Resolution (`dns.lookup`)**

### What DOES NOT use the Thread Pool?
* **Network Sockets & HTTP Requests**: Network I/O does **NOT** use worker threads! Operating systems provide non-blocking event notification interfaces (**`epoll`** on Linux, **`kqueue`** on macOS, **`IOCP`** on Windows). A single thread can monitor tens of thousands of active network connections simultaneously!

### Scaling the Thread Pool:
The default thread pool size is 4. If you initiate 8 heavy password hashes simultaneously:
```javascript
// Scale thread pool to match CPU cores before loading any libraries:
process.env.UV_THREADPOOL_SIZE = 8;
```

---

## 4. The Senior Interview Tracing Puzzle

Predict the exact console output order:

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => {
  console.log('5');
});

process.nextTick(() => {
  console.log('6');
});

console.log('7');
```

### The Step-by-Step Proof:
1. `console.log('1')` $\to$ Synchronous $\to$ **Prints: `1`**
2. `setTimeout(..., 0)` $\to$ Callback pushed to Timers Macrotask Queue.
3. `new Promise(executor)` $\to$ **Runs SYNCHRONOUSLY!** $\to$ `console.log('4')` $\to$ **Prints: `4`**
4. `resolve()` pushes `.then()` to **Promise Microtask Queue**.
5. `process.nextTick()` pushes to **NextTick Microtask Queue**.
6. `console.log('7')` $\to$ Synchronous $\to$ **Prints: `7`**
7. Call stack empty $\to$ Drain Microtasks:
   * `process.nextTick` runs first $\to$ **Prints: `6`**
   * Promise microtasks run next $\to$ **Prints: `5`**
8. Microtask queue empty $\to$ Process Timers Macrotask:
   * `console.log('2')` runs $\to$ **Prints: `2`**
   * Pushes `.then(() => console.log('3'))` to Microtask Queue.
9. Microtask queue drained immediately before any further macrotask:
   * `console.log('3')` runs $\to$ **Prints: `3`**

### Output:
$$\mathbf{1 \to 4 \to 7 \to 6 \to 5 \to 2 \to 3}$$
