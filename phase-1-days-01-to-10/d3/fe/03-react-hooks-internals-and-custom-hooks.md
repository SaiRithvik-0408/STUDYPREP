# Day 3: Frontend Engineering & React Hooks Internals

To clear senior React interviews, you cannot just know the syntax of `useState` and `useEffect`. You must understand **how hooks are represented in memory** inside the Fiber node and why the **Rules of Hooks** exist.

---

## 1. How Hooks Work in Memory: The Singly-Linked List

In class components, state was an object property (`this.state = {}`).
In functional components, **all hooks belonging to a component are stored as a singly-linked list** on the component's Fiber node under the property `memoizedState`.

```typescript
// Conceptual Internal React Hook Structure
interface Hook {
  memoizedState: any;      // Holds current value (e.g. 42, or the effect callback)
  baseState: any;
  queue: UpdateQueue | null; // Queue of pending state transitions (setCount(c => c + 1))
  next: Hook | null;       // Pointer to the NEXT hook called in this component
}
```

```
FiberNode (for MyComponent)
    │
    └── memoizedState ──► [ Hook 1: useState(0) ]
                                  │
                                 next
                                  ▼
                          [ Hook 2: useState('John') ]
                                  │
                                 next
                                  ▼
                          [ Hook 3: useEffect(...) ]
                                  │
                                 next
                                  ▼
                                null
```

---

## 2. Why the "Rules of Hooks" Exist (No `if` statements or loops)

React's official documentation states:
> *"Don't call Hooks inside loops, conditions, or nested functions."*

### Why? The Underlying Mechanics:
React does **not** identify hooks by name or string key. It tracks them **strictly by the order of invocation**!
1. On **Mount Render**: React creates the linked list: Hook 1 $\to$ Hook 2 $\to$ Hook 3.
2. On **Update Render**: React initializes a pointer `workInProgressHook = fiber.memoizedState`. Every time a hook runs, React reads `workInProgressHook.memoizedState` and advances the pointer: `workInProgressHook = workInProgressHook.next`.

### What happens if you place a hook inside an `if` condition?
```javascript
function Counter({ shouldTrack }) {
  const [count, setCount] = useState(0); // Hook 1

  if (shouldTrack) {
    useEffect(() => { ... }, []);        // Hook 2 (Conditional!)
  }

  const [name, setName] = useState("Alex"); // Hook 3
}
```

* **Render 1 (`shouldTrack = true`)**:
  * Hook 1 = `count`
  * Hook 2 = `useEffect`
  * Hook 3 = `name`
* **Render 2 (`shouldTrack = false`)**:
  * Call 1: `useState(0)` reads Hook 1 (`count`). Pointer moves to Hook 2.
  * `if (false)` skips `useEffect`.
  * Call 2: `useState("Alex")` executes next! React reads Hook 2 from the previous render (which was an `useEffect` object!) thinking it's state for `name`.
  * **Result**: Memory layout corruption! React throws an unrecoverable runtime error.

---

## 3. Production Custom Hook: `useDebounce`

When a user types into an autocomplete search box, sending an API request on every keystroke overwhelms the backend and creates race conditions.

```tsx
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Schedule update after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup function: If 'value' or 'delayMs' changes before timer completes,
    // clear the timer and restart!
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

// Usage in Component:
export function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // 300ms debounce

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchSearchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```
