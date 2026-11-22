# Day 6: Frontend Engineering & TanStack Query (Server State Architecture)

A common architectural flaw in mid-level React codebases is storing asynchronous API data inside Redux or Zustand. Modern frontend engineering separates **Client State** from **Server State**.

---

## 1. Client State vs Server State

| Dimension | Client State (Zustand) | Server State (TanStack Query) |
| :--- | :--- | :--- |
| **Ownership** | Synchronously owned by the browser. | Asynchronously owned by the remote database server. |
| **Persistence** | Lost on page refresh (unless stored in localStorage). | Stored permanently in remote database. |
| **Integrity** | Always up-to-date locally. | Can become **stale** at any moment if another user updates it! |
| **Challenges** | Component re-renders, actions, UI state. | Caching, deduplication, retry logic, optimistic updates, polling. |

---

## 2. The Core Mechanics: `staleTime` vs `gcTime`

```
Data Fetched ──► [ FRESH ] ──(staleTime expires)──► [ STALE ] ──(Component unmounts + gcTime)──► [ GARBAGE COLLECTED ]
```

* **`staleTime` (Default: 0 ms)**: How long the fetched data is considered "fresh".
  * While data is fresh, navigating back to the page reads from cache **instantly with zero network requests**.
  * Once data becomes stale, TanStack Query serves the cached data immediately (instant UI) while triggering a **background re-fetch** to sync fresh data.
* **`gcTime` (Garbage Collection Time, formerly `cacheTime`, Default: 5 minutes)**: How long unused data remains in memory after all subscribing components unmount before being deleted.

---

## 3. Production Query Hook Architecture

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// 1. Dedicated custom query hook with structured query keys
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['users', userId], // Cache is unique per userId!
    queryFn: async (): Promise<UserProfile> => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
    retry: 2, // Auto-retry failed requests twice
  });
}

// 2. Mutation with Optimistic Updates
export function useUpdateUserName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newName }: { userId: string; newName: string }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      return res.json();
    },

    // OPTIMISTIC UPDATE: Update UI instantly before server replies!
    onMutate: async ({ userId, newName }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users', userId] });

      // Snapshot previous value for rollback
      const previousUser = queryClient.getQueryData<UserProfile>(['users', userId]);

      // Optimistically set new data in cache
      queryClient.setQueryData<UserProfile>(['users', userId], (old) =>
        old ? { ...old, name: newName } : undefined
      );

      return { previousUser, userId };
    },

    // If server throws an error, roll back to previous state!
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['users', context.userId], context.previousUser);
      }
    },

    // Always refetch to ensure source-of-truth alignment
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
}
```
