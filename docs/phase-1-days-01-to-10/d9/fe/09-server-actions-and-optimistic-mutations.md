# Day 9: Frontend Engineering & Next.js 15 Server Actions (Optimistic UI)

Next.js 15 Server Actions allow you to run asynchronous server-side code directly from your React components without writing dedicated REST API routes or managing boilerplate `fetch` calls.

---

## 1. What is a Server Action? (`'use server'`)

A Server Action is an asynchronous function marked with the `'use server'` directive that runs strictly on the Node.js server. Next.js automatically creates a secure Remote Procedure Call (RPC) endpoint behind the scenes.

```typescript
// app/actions/todoActions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createTodoAction(formData: FormData) {
  const title = formData.get('title') as string;

  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters long.' };
  }

  await db.todo.create({ data: { title, completed: false } });

  // Revalidate cache: Next.js instantly purges stale Server Component cache!
  revalidatePath('/todos');

  return { success: true };
}
```

---

## 2. Instant User Feedback with `useOptimistic`

When a user adds an item to a list, waiting 400ms for a network round-trip makes the UI feel sluggish. **`useOptimistic`** immediately adds the item to the screen while the Server Action executes in the background:

```tsx
// app/todos/TodoList.tsx
'use client';

import { useOptimistic, useRef } from 'react';
import { createTodoAction } from '@/app/actions/todoActions';

interface Todo {
  id: string;
  title: string;
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  // 1. Declare optimistic state
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTitle: string) => [
      ...state,
      { id: 'temp_' + Date.now(), title: newTitle }, // Rendered instantly!
    ]
  );

  const handleFormAction = async (formData: FormData) => {
    const title = formData.get('title') as string;
    formRef.current?.reset();

    // 2. Trigger instant optimistic UI update
    addOptimisticTodo(title);

    // 3. Execute Server Action across network
    await createTodoAction(formData);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form ref={formRef} action={handleFormAction} className="flex gap-2 mb-4">
        <input name="title" required placeholder="New task..." className="border p-2 rounded flex-1" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <li key={todo.id} className="p-3 bg-gray-50 border rounded shadow-sm">
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
