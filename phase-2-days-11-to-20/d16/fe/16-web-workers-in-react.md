# Day 16: Frontend Engineering & Web Workers

If an operation takes 150ms of CPU time (e.g. client-side image compression, Excel sheet parsing, heavy crypto), executing it in React locks the browser.

---

## 1. Running a Background Thread with Web Worker
```typescript
// worker.ts
self.onmessage = (e) => {
  const { data } = e.data;
  // Heavy CPU computation running on a separate OS thread!
  const processed = data.map((x: number) => x * 2);
  self.postMessage(processed);
};
```