# Day 10: Frontend Engineering & Phase 1 Enterprise Architecture

This manuscript unifies all Phase 1 frontend concepts into an enterprise Next.js 15 App Router architecture.

---

## 1. Enterprise App Router Directory Architecture

```
web-frontend/
├── app/
│   ├── (auth)/                  # Route Group: Isolated login/register layout
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── (dashboard)/             # Route Group: Authenticated dashboard layout
│   │   ├── layout.tsx           # Persistent Sidebar + Header
│   │   ├── page.tsx             # Dashboard Home (Server Component)
│   │   └── ai-assistant/
│   │       └── page.tsx         # Streaming Chat UI
│   ├── api/                     # Route Handlers
│   │   └── chat/route.ts        # Server-Sent Events stream handler
│   ├── error.tsx                # Client Error Boundary
│   ├── loading.tsx              # Instant Streaming Skeleton
│   ├── not-found.tsx            # 404 handler
│   └── layout.tsx               # Root Layout wrapping QueryClientProvider
├── components/
│   ├── ui/                      # Primitive Headless Radix + Tailwind buttons, modals
│   └── chat/                    # Streaming Chat interface components
├── lib/
│   ├── store/                   # Zustand stores (AuthSlice, UISlice)
│   └── api/                     # TanStack Query hooks & fetchers
└── middleware.ts                # Edge Auth Session Guard
```

---

## 2. The Unified Root Layout with Providers

```tsx
// app/layout.tsx
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Enterprise AI SaaS Platform',
  description: 'Production Next.js 15 Architecture',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is instantiated once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```
