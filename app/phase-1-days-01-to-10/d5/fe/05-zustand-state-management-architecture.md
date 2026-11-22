# Day 5: Frontend Engineering & Zustand Global State Architecture

In modern React ecosystems, legacy Redux boilerplate has largely been replaced by lightweight, decoupled stores like **Zustand**. This manuscript covers Zustand's architecture, selector-based re-render optimization, and the slice pattern.

---

## 1. Why Zustand Replaced Redux

```
┌────────────────────────────────────────────────────────┐
│                      LEGACY REDUX                      │
├────────────────────────────────────────────────────────┤
│ - Action Types, Action Creators, Reducers, Slices      │
│ - Mandatory Context Provider wrapping root `<App />`   │
│ - High boilerplate for simple state mutations          │
└────────────────────────────────────────────────────────┘
                           vs
┌────────────────────────────────────────────────────────┐
│                   MODERN ZUSTAND                       │
├────────────────────────────────────────────────────────┤
│ - Zero Context Providers (External Store Pattern)      │
│ - Powered by React 18 `useSyncExternalStore`           │
│ - Minimalist API: `set((state) => ({ ... }))`          │
│ - Precise selector subscriptions (Zero extra renders!) │
└────────────────────────────────────────────────────────┘
```

---

## 2. The Selector Pattern: Preventing Re-Renders

The most critical feature of Zustand is **Selector Subscriptions**. Components only re-render if the **specific property returned by their selector** changes!

```tsx
import { create } from 'zustand';

interface StoreState {
  count: number;
  username: string;
  increment: () => void;
  setUsername: (name: string) => void;
}

export const useAppStore = create<StoreState>((set) => ({
  count: 0,
  username: 'Alex',
  increment: () => set((state) => ({ count: state.count + 1 })),
  setUsername: (name) => set({ username: name }),
}));

// Component A: ONLY cares about username
export function UserBadge() {
  // ✅ Selector: Component will NEVER re-render when count increments!
  const username = useAppStore((state) => state.username);
  console.log("Rendered UserBadge");
  return <span>{username}</span>;
}

// Component B: ONLY cares about count
export function CounterButton() {
  // ✅ Selector: Component will NEVER re-render when username changes!
  const count = useAppStore((state) => state.count);
  const increment = useAppStore((state) => state.increment);
  console.log("Rendered CounterButton");
  return <button onClick={increment}>Count: {count}</button>;
}
```

---

## 3. The Slice Pattern for Large Enterprise Applications

When an application grows, keeping all state in a single file becomes unmaintainable. The **Slice Pattern** allows you to divide state into independent domains:

```typescript
// authSlice.ts
import { StateCreator } from 'zustand';

export interface AuthSlice {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  token: null,
  setToken: (token) => set({ token }),
});

// cartSlice.ts
export interface CartSlice {
  items: string[];
  addItem: (item: string) => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
});

// rootStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type RootStore = AuthSlice & CartSlice;

export const useBoundStore = create<RootStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createCartSlice(...a),
      }),
      { name: 'app-storage' } // Automatically persists to localStorage!
    )
  )
);
```
