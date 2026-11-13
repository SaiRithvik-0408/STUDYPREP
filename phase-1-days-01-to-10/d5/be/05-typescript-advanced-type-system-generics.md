# Day 5: Backend Engineering & Advanced TypeScript Systems

Modern full-stack and backend codebases in Node.js demand strict type safety. To clear senior technical rounds, you must understand TypeScript's type system as a **Turing-complete compile-time programming language**.

---

## 1. Generics with Structural Constraints

Generics allow functions and classes to work over a variety of types while preserving complete type integrity.

```typescript
// Enforce that T must be an object containing at least an 'id' string property
interface Identifiable {
  id: string;
}

function indexEntities<T extends Identifiable>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}
```

---

## 2. Conditional Types & The `infer` Keyword

A **Conditional Type** selects one of two possible types based on a condition expressed as a type relationship test:

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;       // false
```

### The `infer` Keyword:
`infer` introduces a type variable within a condition to extract and capture a type on the fly:

```typescript
// Extract the return type of any function:
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: "101", username: "alex", role: "ADMIN" as const };
}

type User = MyReturnType<typeof getUser>;
// Inferred: { id: string; username: string; role: "ADMIN" }
```

### Unwrapping Promises (`Awaited<T>`):
```typescript
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type DeepPromise = Promise<Promise<string>>;
type Unwrapped = MyAwaited<DeepPromise>; // string
```

---

## 3. Mapped Types & Key Remapping (`as`)

Mapped types build new types by transforming properties of an existing type.

```typescript
// Transform all properties into getters:
type CreateGetters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface UserState {
  name: string;
  age: number;
}

type UserGetters = CreateGetters<UserState>;
// Resulting Type:
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

---

## 4. Rebuilding Standard Utility Types from Scratch

Interviewers often ask you to implement TypeScript's built-in utility types to test your understanding:

```typescript
// 1. Partial: Makes all properties optional
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 2. Required: Strips the '?' from all properties
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// 3. Readonly: Freezes all properties
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 4. Pick: Selects a subset of keys
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 5. Exclude: Excludes from union
type MyExclude<T, U> = T extends U ? never : T;

// 6. Omit: Drops a subset of keys
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;

// 7. Record: Constructs an object type with specified keys and value types
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```
