# Day 2: Frontend Engineering & React Fiber Architecture

To pass senior React engineering interviews, you must understand **React Fiber**: the internal reconciliation engine rewritten from scratch in React 16 and expanded in React 18/19 for Concurrent rendering.

---

## 1. Why Did React Rewrite Its Core? (Stack Reconciler vs Fiber)

### The Legacy Problem: Stack Reconciler (React 15 and below)
* Used standard JavaScript **recursion** to traverse component trees.
* Once recursion started, it could not stop until it visited every single component.
* If rendering took 80ms on a large tree:
  * The browser main thread was completely locked.
  * User keystrokes, button clicks, and CSS animations dropped below 60fps (stutter/jank).

### The Solution: React Fiber
**Fiber is a Virtual Stack Frame architecture**. It replaces native JavaScript call stack recursion with an **asynchronous singly-linked list traversal**.
* React can now **split rendering work into small units (chunks)**.
* After processing a unit of work, React yields control back to the browser main thread to handle user events or animations.
* React can **pause, abort, or prioritize** updates (e.g. user typing has higher priority than an offscreen list re-render).

---

## 2. The Fiber Node Data Structure

Every React element has a corresponding **Fiber Node** in memory:

```typescript
interface FiberNode {
  // Identification
  tag: WorkTag;              // 0: FunctionComponent, 5: HostComponent ('div'), etc.
  key: string | null;
  type: any;                 // The component function or tag name

  // Singly Linked List Tree Pointers
  child: FiberNode | null;   // First child
  sibling: FiberNode | null; // Sibling to the right
  return: FiberNode | null;  // Parent Fiber

  // State & Hooks
  memoizedProps: any;        // Props from last render
  memoizedState: any;        // Linked list of hooks (useState, useEffect)

  // Scheduling & Priorities
  lanes: Lanes;              // 32-bit bitmask representing priority level

  // Double Buffering
  alternate: FiberNode | null; // Pointer to counterpart in opposite tree
}
```

### The Linked List Pointers Visualized:
Instead of `node.children = [child1, child2]`, Fiber uses:
* `child` $\to$ points to the first child.
* `sibling` $\to$ points to the next sibling.
* `return` $\to$ points to the parent.

```
       [ App Fiber ]
             │
           child
             ▼
     [ Header Fiber ] ────sibling────► [ MainContent Fiber ]
                                                │
                                              child
                                                ▼
                                         [ Article Fiber ]
```

---

## 3. The Double Buffering Technique

React borrows **Double Buffering** from video game graphics engines to prevent visual tearing or half-updated DOM on screen:

```
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│        CURRENT FIBER TREE       │        │     WORK-IN-PROGRESS (WIP) TREE │
│   (What the user sees on screen)│        │   (Built asynchronously in RAM) │
├─────────────────────────────────┤        ├─────────────────────────────────┤
│            Fiber A              │◄──────►│            Fiber A'             │
│          (alternate)            │        │          (alternate)            │
└─────────────────────────────────┘        └─────────────────────────────────┘
                                                            │
                                  Commit Phase Swaps Root:  │
                                  root.current = workInProgress
                                                            ▼
                                        Real DOM Updates Instantly!
```

1. **Current Tree**: Represents the UI currently painted on the screen.
2. **Work-in-Progress (WIP) Tree**: As state updates occur, React clones fibers and performs reconciliation off-screen in memory.
3. If a high-priority user interaction occurs (like typing in a search bar), React can **discard the WIP tree** and start a new render without affecting what the user sees.
4. When the WIP tree is completely ready, React swaps the root pointer in one synchronous commit phase.

---

## 4. Concurrent React: `useTransition` vs `useDeferredValue`

React 18/19 uses **Lanes** (32-bit bitmasks) to assign priorities to updates:
* **Immediate / Urgent**: User typing, clicks, touches.
* **Transition / Non-Urgent**: Filtering a list of 1,000 items, searching, tab switching.

### Using `useTransition`:
```tsx
import { useState, useTransition } from 'react';

export function SearchList({ allItems }: { allItems: string[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredList, setFilteredList] = useState(allItems);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Urgent update: Input updates immediately without lag!
    setSearchTerm(e.target.value);

    // 2. Non-urgent update: Wrapped in startTransition
    // If user types again before this finishes, React cancels this WIP render!
    startTransition(() => {
      const filtered = allItems.filter(item =>
        item.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredList(filtered);
    });
  };

  return (
    <div>
      <input value={searchTerm} onChange={handleInputChange} placeholder="Search..." />
      {isPending && <p>Filtering list...</p>}
      <ul>
        {filteredList.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```
