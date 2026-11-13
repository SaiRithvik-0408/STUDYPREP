# Day 5: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 5 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In Floyd's Cycle Detection algorithm, why is it mathematically guaranteed that the fast pointer ($2\times$ speed) will collide with the slow pointer ($1\times$ speed) if a cycle exists?
   * *Answer*: Once both pointers enter the cycle, the relative distance between them decreases by exactly 1 node per iteration ($2 - 1 = 1$). Because the gap shrinks by 1 node on every step, the fast pointer cannot skip over the slow pointer; they must collide in at most $C$ steps (where $C$ is the cycle length).
2. **Backend**: What does the `infer` keyword do in TypeScript conditional types? Give a concrete example.
   * *Answer*: `infer` introduces a variable inside a conditional type that instructs TypeScript's compiler to deduce and capture an unknown type from an expression. For example, in `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`, `infer R` captures the return type of any function passed into `T`.
3. **Frontend**: Why does Zustand avoid the re-render performance issues common in standard React Context API architectures?
   * *Answer*: React Context triggers a re-render of **all consumer components** whenever any property on the context object changes. Zustand operates as an external store using selectors (`useStore(state => state.field)`), allowing components to subscribe only to the specific slice of state they care about, completely skipping re-renders when other fields mutate.
4. **DevOps**: How does Docker Compose enable the API container to connect to PostgreSQL without knowing its physical IP address?
   * *Answer*: Docker Compose creates a private user-defined bridge network and runs an embedded DNS server. Any container can reach another container on the same network by using its service name (e.g. `postgres:5432`) as the hostname, which Docker resolves automatically.
5. **AI**: In an autonomous ReAct agent loop, what are the two most critical safety mechanisms required to prevent runaway cloud bills?
   * *Answer*: (1) A strict iteration limit (e.g. `maxIterations = 5`) to guarantee the loop terminates, and (2) Tool call cycle detection to catch situations where the agent repeatedly invokes the same tool with the same parameters in an infinite loop.

---

## 💻 Part 2: TypeScript Type Gymnastics Challenge

Implement `DeepReadonly<T>`: A utility type that recursively makes all nested object properties, arrays, and sub-objects `readonly`.

### The Solution:
```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Function
    ? T[K]
    : T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// Test Case:
interface ComplexConfig {
  server: {
    port: number;
    database: {
      url: string;
      pool: {
        max: number;
      };
    };
  };
}

type FrozenConfig = DeepReadonly<ComplexConfig>;
// Now frozenConfig.server.database.pool.max = 10 throws a compile-time TypeScript error!
```
