# Day 2: Backend Engineering & Node.js Memory Profiling

A senior backend engineer must know how to diagnose and prevent memory leaks that cause Node.js services to crash with `JavaScript heap out of memory` under production loads.

---

## 1. The V8 Memory Architecture (Generational Garbage Collection)

V8 organizes Heap memory into distinct spaces based on object lifecycles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          V8 HEAP MEMORY                                │
├───────────────────────────────────┬────────────────────────────────────┤
│         NEW SPACE (Young Gen)     │        OLD SPACE (Old Gen)         │
│   ┌─────────────┬─────────────┐   │   ┌────────────────────────────┐   │
│   │ From-Space  │  To-Space   │   │   │ Survives 2 Minor GCs       │   │
│   │ (1 - 64 MB) │ (1 - 64 MB) │   │   │ (Up to ~1.4 GB / 4 GB)     │   │
│   └─────────────┴─────────────┘   │   └────────────────────────────┘   │
│   * Minor GC (Scavenge Algorithm) │   * Major GC (Mark-Sweep-Compact)  │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 1.1 The Weak Generational Hypothesis
Most allocated objects in software die young (temporary variables, loop counters, function parameters). Only a small percentage survive long-term.

### 1.2 Minor GC (Scavenge Algorithm)
* Occurs only in the **New Space**.
* Highly optimized and blazingly fast (runs in 1-2 milliseconds).
* Uses Cheney’s copying algorithm: live objects in `From-Space` are copied to `To-Space`, and dead objects are discarded en masse without traversing them individually.
* If an object survives **two Minor GCs**, it is **promoted to Old Space**.

### 1.3 Major GC (Mark-Sweep-Compact)
* Runs when Old Space fills up.
* **Mark**: Traverses object graph from root pointers (Call Stack, global objects) and marks all reachable objects.
* **Sweep**: Reclaims memory addresses of unreachable objects.
* **Compact**: Defragments memory by shifting remaining objects together to eliminate memory fragmentation.
* Major GC causes a brief **Stop-The-World pause**, which is why memory management is critical.

---

## 2. The 3 Most Common Production Memory Leaks in Node.js

### Leak Pattern 1: Unbounded In-Memory Caches
```typescript
// ❌ CRITICAL LEAK: This Map grows forever until the server crashes!
const userSessionCache = new Map<string, any>();

app.get('/user/:id', async (req, res) => {
  if (!userSessionCache.has(req.params.id)) {
    const data = await fetchUserFromDB(req.params.id);
    userSessionCache.set(req.params.id, data); // NEVER EVICTED!
  }
  res.json(userSessionCache.get(req.params.id));
});
```
* **Solution**: Always use an LRU (Least Recently Used) cache with a hard `maxSize` cap or use **Redis** with a strict TTL (Time-To-Live).

---

### Leak Pattern 2: Forgotten Event Listeners & Timers
Every time a WebSocket or HTTP request connects, adding an event listener to a shared EventEmitter without removing it causes a leak:

```typescript
// ❌ LEAK: Global emitter keeps a reference to the request scope!
import EventEmitter from 'node:events';
const globalBus = new EventEmitter();

app.get('/stream', (req, res) => {
  const onData = (data: any) => res.write(JSON.stringify(data));
  globalBus.on('message', onData);

  // If the client disconnects without cleaning up:
  req.on('close', () => {
    // FIX: MUST remove listener!
    globalBus.removeListener('message', onData);
  });
});
```

---

### Leak Pattern 3: Closures Capturing Giant Unused Variables
```typescript
function processLargeUpload() {
  const hugeDataBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB

  return function getMetadata() {
    // Even if getMetadata only needs this small string,
    // V8 might retain the entire lexical environment in Heap!
    return "Upload completed";
  };
}
```

---

## 3. How to Profile and Diagnose Memory Leaks

When a production Node.js service is leaking memory:

1. **Start Node with the Inspector**:
   ```bash
   node --inspect=0.0.0.0:9229 dist/server.js
   ```
2. **Open Chrome DevTools**:
   * Navigate to `chrome://inspect` in Google Chrome.
   * Click **Inspect** on your Node process.
3. **Capture Heap Snapshots**:
   * Take **Snapshot 1** at baseline.
   * Simulate 1,000 requests using a load tester (e.g. `autocannon`).
   * Take **Snapshot 2**.
   * Compare snapshots using the **Comparison View**: Sort by **# Delta** or **Size Delta** to see which constructor objects (e.g. `Array`, `Closure`, `Object`) grew and refused to be garbage-collected.

### Key Metrics:
* **Shallow Size**: The memory held directly by the object itself (primitive fields, pointers).
* **Retained Size**: The total memory that would be freed if this object was garbage collected (includes all downstream objects it holds references to).
