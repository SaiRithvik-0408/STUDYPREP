# Day 14: Frontend Engineering & React 19 Actions

React 19 standardizes asynchronous transitions for form submissions:

```tsx
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Submit'}</button>;
}

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await updateUser(formData);
      return res;
    },
    null
  );

  return (
    <form action={formAction}>
      <input name="username" />
      <SubmitButton />
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```