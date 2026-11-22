# Day 11: Frontend Engineering & Next.js 15 Cache Invalidation

Next.js 15 treats caching with explicit opt-in controls, replacing the aggressive caching defaults of Next.js 14.

---

## 1. Data Fetching Control Primitives

```typescript
// 1. Force dynamic fetch (Always bypass cache, read live database)
const freshData = await fetch('https://api.myapp.com/data', { cache: 'no-store' });

// 2. Time-based Revalidation (ISR: Incremental Static Regeneration)
const semiStaticData = await fetch('https://api.myapp.com/data', {
  next: { revalidate: 3600 } // Revalidate at most once every hour
});

// 3. Tag-Based On-Demand Revalidation (Enterprise Standard)
const taggedData = await fetch('https://api.myapp.com/products', {
  next: { tags: ['products-list'] }
});
```

### On-Demand Cache Purging via Server Action:
```typescript
'use server';

import { revalidateTag } from 'next/cache';

export async function addProductAction(productData: any) {
  await db.product.create({ data: productData });
  revalidateTag('products-list');
}
```