# Day 8: Frontend Engineering & Next.js 15 App Router (RSCs vs Client Components)

Next.js 14 and 15 App Router fundamentally changed how React applications are constructed. Understanding **React Server Components (RSC)**, **Hydration Boundaries**, and **Streaming** is mandatory for modern full-stack interviews.

---

## 1. CSR vs SSR vs React Server Components (RSC)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT-SIDE RENDERING (CSR - Vite / CRA)                            │
│    - Browser downloads empty <div id="root"></div>                     │
│    - Downloads huge 2MB JavaScript bundle                              │
│    - Runs JS, fetches APIs, and renders UI                             │
│    * Slow initial paint, bad for SEO, large bundle size                │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CLASSIC SERVER-SIDE RENDERING (SSR - Next.js Pages Router)          │
│    - Server generates HTML string on request                           │
│    - Fast initial paint, BUT browser STILL downloads 2MB bundle to     │
│      "hydrate" (attach event listeners to) the entire page             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. REACT SERVER COMPONENTS (RSC - Next.js App Router)                  │
│    - Server Components execute ONLY on the Node.js server              │
│    - Direct database queries inside components: `await db.user.find()` │
│    - Shipped to browser as a virtual UI tree (RSC Payload)             │
│    - *ZERO JavaScript bytes shipped to client for Server Components!*  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server Components vs Client Components (`'use client'`)

By default in the `app/` directory, **every component is a Server Component**.

```tsx
// app/dashboard/page.tsx (Server Component by default!)
import { db } from '@/lib/db';
import { UserGreeting } from './UserGreeting'; // Client component

export default async function DashboardPage() {
  // Direct database query! No internal API route needed!
  // Secure credentials and heavy database packages never touch the browser!
  const users = await db.user.findMany();

  return (
    <main className="p-8">
      <h1>Dashboard</h1>
      {/* Passing data across the client boundary */}
      <UserGreeting initialUsers={users} />
    </main>
  );
}
```

### What does `'use client'` actually mean?
`'use client'` does **NOT** mean "render only on the client".
* It defines a **boundary**: everything below this directive will be included in the browser's JavaScript bundle.
* Use `'use client'` **only when you need**:
  1. Interactivity: `onClick`, `onChange`, `onSubmit`.
  2. React Hooks: `useState`, `useEffect`, `useReducer`.
  3. Browser-only APIs: `window`, `localStorage`, `geolocation`.

```tsx
// app/dashboard/UserGreeting.tsx
'use client'; // Marks this component as interactive

import { useState } from 'react';

export function UserGreeting({ initialUsers }: { initialUsers: any[] }) {
  const [filter, setFilter] = useState('');
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <p>Total users: {initialUsers.length}</p>
    </div>
  );
}
```

---

## 3. The Serialization Boundary Rule

When a Server Component passes props to a Client Component:
* **The props MUST be serializable to JSON** (strings, numbers, booleans, arrays, plain objects).
* You **CANNOT** pass:
  * Functions or callbacks (`onClick={() => ...}`)
  * Class instances (e.g. `new Date()` should be passed as an ISO string or timestamp, Prisma models with custom methods).
  * Symbols.

---

## 4. Instant Loading States with Streaming & React Suspense

Instead of waiting for a slow database query to finish before painting the page, Next.js streams the page in chunks:

```tsx
import { Suspense } from 'react';
import { RevenueChart } from './RevenueChart';
import { ChartSkeleton } from './ChartSkeleton';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      {/* The header renders instantly! The slow chart streams in when ready! */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}
```
