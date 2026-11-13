# Day 4: Backend Engineering & Promises Under the Hood

In senior engineering interviews, you cannot treat `async/await` as syntax magic. You must understand how V8 models Promises in memory, compiles `await` into **Generator State Machines**, and handles concurrency safely.

---

## 1. What is a Promise in Memory?

A JavaScript `Promise` is an internal C++ object in V8 with three hidden internal slots:

```
┌────────────────────────────────────────────────────────┐
│                    PROMISE OBJECT                      │
├────────────────────────────────────────────────────────┤
│ [[PromiseState]]: "pending" | "fulfilled" | "rejected" │
│ [[PromiseResult]]: undefined | resolvedValue | error   │
│ [[PromiseFulfillReactions]]: [ CallbackQueue ]         │
│ [[PromiseRejectReactions]]:  [ CallbackQueue ]         │
│ [[PromiseIsHandled]]: boolean (Tracks unhandled errors)│
└────────────────────────────────────────────────────────┘
```

1. **State Immutability**: Once `[[PromiseState]]` transitions from `"pending"` to `"fulfilled"` or `"rejected"`, it is permanently frozen. It can never be resolved or rejected again.
2. **Reactions**: When you call `.then(cb)`, the callback is not executed immediately. It is pushed into the `[[PromiseFulfillReactions]]` array.
3. When `resolve(val)` is invoked, V8 changes the state and schedules all queued reaction callbacks into the **Microtask Queue**.

---

## 2. How V8 Compiles `async/await` (Generator State Machines)

`async/await` is syntactic sugar built on top of **Generators (`function*`) and Promises**.

```javascript
// What you write:
async function fetchUserData(userId) {
  const user = await api.getUser(userId);
  const orders = await api.getOrders(user.id);
  return { user, orders };
}
```

### What V8 and Babel compile it into:
V8 transforms the function into a state machine that yields execution and pauses its stack frame:

```javascript
function fetchUserData(userId) {
  return spawn(function* () {
    // State 0: Execution starts
    const user = yield api.getUser(userId);

    // State 1: Resumed after getUser resolves
    const orders = yield api.getOrders(user.id);

    // State 2: Final return
    return { user, orders };
  });
}

// The Coroutine Runner (Runtime Helper)
function spawn(generatorFunc) {
  return new Promise((resolve, reject) => {
    const iterator = generatorFunc();

    function step(nextFn) {
      let next;
      try {
        next = nextFn();
      } catch (err) {
        return reject(err);
      }

      if (next.done) {
        return resolve(next.value);
      }

      // Convert yielded value into Promise and resume iterator on fulfillment
      Promise.resolve(next.value).then(
        (val) => step(() => iterator.next(val)),
        (err) => step(() => iterator.throw(err))
      );
    }

    step(() => iterator.next());
  });
}
```

> **Takeaway**: When execution reaches `await`, the function **yields control back to the caller** and pops off the Call Stack. The remaining code resumes only after the awaited promise resolves and drains through the Microtask Queue.

---

## 3. Promise Concurrency: Choosing the Right Primitive

Interviewers frequently test your ability to orchestrate concurrent network requests without blocking or crashing.

| Method | Behavior on Rejection | Best Used For |
| :--- | :--- | :--- |
| **`Promise.all([p1, p2])`** | **Fails fast**: Rejects immediately if ANY single promise fails, discarding others. | Transactional batching where all operations must succeed (e.g. creating user + org). |
| **`Promise.allSettled([p1, p2])`** | **Never rejects**: Waits for all promises to finish and returns an array of status objects `{ status: 'fulfilled' \| 'rejected' }`. | Independent tasks where some can fail without breaking the whole request (e.g. sending notifications to 10 users). |
| **`Promise.race([p1, p2])`** | Resolves or rejects as soon as the **first** promise settles. | Enforcing request timeouts (racing an API call against a `setTimeout` reject). |
| **`Promise.any([p1, p2])`** | Resolves as soon as the **first promise succeeds**. Only rejects if *all* promises fail (`AggregateError`). | Redundant replicas: querying 3 mirror servers and taking whichever answers first. |

---

## 4. Production Hardening: Unhandled Rejections

In Node.js, an unhandled Promise rejection used to log a warning. In modern Node.js, **an unhandled rejection terminates the entire process with exit code 1**.

```typescript
// Essential production error boundaries:
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to Sentry / Datadog
  // Gracefully close server and exit
});

process.on('uncaughtException', (error: Error) => {
  console.error('CRITICAL: Uncaught Exception:', error);
  process.exit(1); // Mandatory to exit because application state is corrupted!
});
```
