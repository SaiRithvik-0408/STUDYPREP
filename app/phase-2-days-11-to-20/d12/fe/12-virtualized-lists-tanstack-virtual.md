# Day 12: Frontend Engineering & List Virtualization

Rendering 10,000 DOM nodes in React creates 50,000 internal Fiber nodes, causes massive memory overhead, and slows browser scrolling to 10fps.

---

## 1. Virtualization: Rendering ONLY What Is Visible

If the viewport can fit 10 items, **we only render 12 DOM nodes** (10 visible + 2 overscan buffer), dynamically swapping their text and vertical offsets as the user scrolls:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualUserList({ users }: { users: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto border rounded">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className="flex items-center px-4 border-b"
          >
            {users[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```