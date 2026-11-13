# Day 4: Variable Sliding Window, Promise Compilation, React Memoization & Function Calling

Welcome to Day 4. Today we tackle variable-size sliding windows, examine how the V8 engine compiles `async/await` and Promises into state machines, optimize React render performance without premature memoization, configure Docker persistent volumes, and give LLMs the power of tool execution via Function Calling.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | File Path | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/04-sliding-window-variable-and-substrings.md`](./dsa/04-sliding-window-variable-and-substrings.md) | 2 Hours | Variable Sliding Window: Longest Substring Without Repeating Characters, Minimum Size Subarray Sum (All Approaches). |
| **Backend** | [`be/04-promises-and-async-await-internals.md`](./be/04-promises-and-async-await-internals.md) | 1 Hour | Promises Under the Hood: Internal states, `async/await` compilation into generator state machines. |
| **Frontend** | [`fe/04-react-memo-usememo-usecallback.md`](./fe/04-react-memo-usememo-usecallback.md) | 1 Hour | Render Performance: React.memo, `useMemo`, `useCallback`, referential stability, and when NOT to memoize. |
| **Docker** | [`docker/04-docker-volumes-and-data-persistence.md`](./docker/04-docker-volumes-and-data-persistence.md) | 30 Mins | Data Persistence: Bind Mounts vs Named Volumes, Volume drivers, preventing data loss on container recreation. |
| **AI** | [`ai/04-function-calling-and-tool-execution.md`](./ai/04-function-calling-and-tool-execution.md) | 30 Mins | LLM Function Calling: Declaring tools with JSON schemas, parsing tool arguments, executing local backend code. |
| **Others** | [`others/04-async-drills-and-quizzes.md`](./others/04-async-drills-and-quizzes.md) | 30 Mins | Async execution puzzles, variable window drills, and self-assessment quiz. |

---

## 🎯 Day 4 Mastery Checklist
- [ ] Master the dynamic sliding window pattern: expand `right` until invalid, shrink `left` while invalid.
- [ ] Solve Longest Substring Without Repeating Characters in $O(N)$ with an index cache map.
- [ ] Explain how `async/await` is desugared into Generators and Promise microtasks by Babel/V8.
- [ ] Understand why passing inline functions to child components breaks `React.memo` without `useCallback`.
- [ ] Persist database files using Docker Named Volumes across container rebuilds.
- [ ] Implement a full Function Calling loop where an LLM calls a local JavaScript weather/database function.
