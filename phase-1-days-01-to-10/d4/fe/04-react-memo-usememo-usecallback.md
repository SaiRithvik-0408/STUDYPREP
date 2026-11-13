# Day 4: Frontend Engineering & React Performance Optimization

The most common mistake junior and mid-level React developers make is wrapping every function in `useCallback` and every object in `useMemo` without understanding how React detects changes.

---

## 1. The React Re-Render Rule

By default in React:
> **When a parent component re-renders, ALL of its child components re-render recursively**, regardless of whether their props changed!

```
ParentComponent (State changes: count++)
    │
    ├──► ChildComponentA (Props didn't change, but RE-RENDERS!)
    └──► ChildComponentB (Props didn't change, but RE-RENDERS!)
```

Re-rendering a component is not necessarily slow. Re-rendering simply means calling the component function in memory to produce a new Virtual DOM node. **It only becomes a performance bottleneck if the child component tree is heavy or renders expensive sub-elements.**

---

## 2. `React.memo` & The Referential Equality Trap

`React.memo` is a higher-order component that prevents a component from re-rendering if its props are shallowly equal (`Object.is(prevProp, nextProp)`).

```tsx
interface UserProps {
  name: string;
  onSelect: () => void;
}

// Child is memoized:
const UserItem = React.memo(function UserItem({ name, onSelect }: UserProps) {
  console.log(`Rendered: ${name}`);
  return <button onClick={onSelect}>{name}</button>;
});
```

### The Referential Equality Trap:
Look at this parent component:

```tsx
function UserList() {
  const [filter, setFilter] = useState('');

  // ❌ TRAP: This function is re-created with a BRAND NEW memory address on EVERY render!
  const handleSelect = () => {
    console.log("Selected");
  };

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <UserItem name="Alice" onSelect={handleSelect} />
    </div>
  );
}
```

* When the user types in `<input>`, `setFilter` causes `UserList` to re-render.
* JavaScript creates a new function object for `handleSelect` at memory address `0x9000`.
* `UserItem`'s `React.memo` compares:
  `Object.is(prevProps.onSelect, nextProps.onSelect)` $\implies$ `0x8000 === 0x9000` $\implies$ **`false`!**
* `UserItem` re-renders anyway! **`React.memo` was completely defeated by the un-memoized function reference.**

---

## 3. The Fix: `useCallback` & `useMemo`

### 1. `useCallback`: Stabilizing Function References
`useCallback` caches a function definition between renders:

```tsx
const handleSelect = useCallback(() => {
  console.log("Selected");
}, []); // Empty deps: function reference remains identical across all renders!
```
Now `UserItem` will **not** re-render when `filter` changes.

### 2. `useMemo`: Stabilizing Expensive Values & Object References
`useMemo` caches the calculated result of a pure function:

```tsx
// 1. Expensive calculation:
const sortedProducts = useMemo(() => {
  return heavySortingAlgorithm(products, filter);
}, [products, filter]);

// 2. Object reference stability:
const themeConfig = useMemo(() => ({
  color: isDark ? 'black' : 'white',
  padding: 16,
}), [isDark]);
```

---

## 4. The Cost of Over-Memoizing (When NOT to use them)

Memoization is **not free**.
1. **Memory Cost**: Every `useMemo` and `useCallback` allocates an array for dependencies and an internal hook state object in the Fiber node.
2. **Comparison Cost**: On every single render, React must iterate through the dependency array and perform `Object.is` checks on every dependency.
3. If an operation is simple (e.g. `const fullName = `${firstName} ${lastName}`;`), calculating it directly is $100\times$ cheaper than the memory and CPU overhead of `useMemo`!

### The Rule of Thumb:
* **Only use `React.memo`** if:
  1. The component renders frequently with the exact same props.
  2. The component contains heavy computation or a large DOM sub-tree.
* **Only use `useCallback`** if:
  1. The function is passed as a prop to a child component wrapped in `React.memo`.
  2. The function is used inside the dependency array of a `useEffect`.
