# Day 1: Frontend Engineering & React Foundations

To excel in frontend interviews, you must understand what happens between writing a line of JSX and pixels painting onto the user's screen.

---

## 1. The Real DOM vs The Virtual DOM

### 1.1 Why the Real DOM is Slow for Complex Apps
The **Document Object Model (DOM)** is a tree structure representing HTML.
The browser's rendering engine follows an expensive pipeline:

```
HTML Parse ──► DOM Tree ──┐
                          ├──► Render Tree ──► Layout (Reflow) ──► Paint ──► Composite
CSS Parse  ──► CSSOM    ──┘
```

When you manipulate the real DOM directly using `document.getElementById('root').appendChild(div)`:
* The browser must trigger **Layout (Reflow)**: calculating exact physical coordinates ($x, y$, width, height) of every affected element on screen.
* It triggers **Repaint**: repainting pixels onto layers.
* If you perform 50 DOM updates in a loop, you can trigger 50 recalculations, causing visible screen lag.

### 1.2 What is the Virtual DOM Actually?
The Virtual DOM (VDOM) is **not magic**. It is simply a lightweight, plain JavaScript object representing the UI in memory.

```javascript
// A simple JSX element:
// <div className="card" onClick={handleClick}><h1>Hello</h1></div>

// Is compiled into a plain VDOM JavaScript Object:
{
  type: 'div',
  props: {
    className: 'card',
    onClick: [Function: handleClick],
    children: [
      {
        type: 'h1',
        props: {
          children: 'Hello'
        }
      }
    ]
  }
}
```

Creating and comparing 10,000 JavaScript objects in memory takes ~2 milliseconds because no browser paint or layout calculations occur.

---

## 2. JSX Compilation Under the Hood

Browsers **cannot execute JSX**. Build tools like Vite (ESBuild / Rollup) or Next.js (SWC) transpile JSX into pure JavaScript function calls.

```jsx
// What you write (JSX):
function UserCard({ name, role }) {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  );
}

// What the compiler outputs (Modern React JSX Transform):
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

function UserCard({ name, role }) {
  return _jsxs("div", {
    className: "user-profile",
    children: [
      _jsx("h2", { children: name }),
      _jsx("p", { children: role })
    ]
  });
}
```

Every JSX tag is simply an invocation of `_jsx(type, props, key)`.

---

## 3. The React Render Pipeline: Render Phase vs Commit Phase

React splits UI updates into two distinct phases:

```
┌────────────────────────────────────────────────────────┐
│ 1. RENDER PHASE (Pure, Computes Differences)           │
│    - Calls your component functions                    │
│    - Creates new Virtual DOM tree                      │
│    - Diffs it against previous Virtual DOM tree        │
│    - Identifies exact list of mutations needed         │
│    - *NO Real DOM changes occur here*                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. COMMIT PHASE (Mutates Real DOM & Paints)            │
│    - Synchronously applies calculated mutations to DOM │
│    - Updates DOM nodes (appendChild, removeChild)      │
│    - Browser recalculates Layout and Paints pixels     │
│    - Triggers useEffect and useLayoutEffect callbacks  │
└────────────────────────────────────────────────────────┘
```

> **Crucial Rule**: The Render Phase must be a **pure function** with zero side-effects. Never make API calls, mutate global variables, or manipulate the DOM directly inside the body of a React component!

---

## 4. The `key` Prop: Why `key={index}` is an Anti-Pattern

When rendering lists, React requires a `key` prop to identify which items have changed, been added, or been removed.

### What Happens When You Use Array Index (`key={index}`)?
Imagine a list of items where the user can delete an item:

```jsx
// ❌ WRONG:
{items.map((item, index) => (
  <ListItem key={index} item={item} />
))}
```

1. You have 3 items: `[Item A (0), Item B (1), Item C (2)]`.
2. The user deletes `Item A` at index 0.
3. In the new render:
   * `Item B` now has index `0`.
   * `Item C` now has index `1`.
4. React compares:
   * Old `key=0` with New `key=0`: React thinks `Item A` simply had its text updated to `Item B`. It reuses the old DOM node and **retains all of Item A's internal local state** (such as focused inputs, checkboxes, or animations).
   * Old `key=2` is missing, so React destroys the last DOM node.
5. **Result**: Checkbox states and input text get scrambled into the wrong rows.

### The Production Rule:
Always use a unique, immutable identifier from your database:
```jsx
// ✅ CORRECT:
{items.map((item) => (
  <ListItem key={item.id} item={item} />
))}
```

---

## 5. Hands-on Component Build: Zero-Dependency Accessible Tab Component

Here is a production-grade, accessible Tab component built from scratch adhering to WAI-ARIA standards:

```tsx
import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
}

export function AccessibleTabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId || (tabs.length > 0 ? tabs[0].id : '')
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="w-full max-w-xl mx-auto my-4 border rounded-lg shadow-sm">
      {/* Tab Header List */}
      <div role="tablist" aria-orientation="horizontal" className="flex border-b bg-gray-50">
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      {activeTab && (
        <div
          role="tabpanel"
          id={`panel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          tabIndex={0}
          className="p-6 focus:outline-none"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
```
