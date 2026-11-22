# Day 2: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 2 Concept Verification Quiz

Answer these 5 core questions to test your comprehension:

1. **DSA**: In the 3Sum problem, why must we sort the array first, and how do we avoid generating duplicate triplets?
   * *Answer*: Sorting ($O(N \log N)$) groups identical numbers together and allows Converging Two Pointers to find pairs in $O(N)$ instead of $O(N^2)$. We avoid duplicates by skipping identical adjacent elements for the fixed outer pointer (`nums[i] === nums[i - 1]`) and for both the `left` and `right` inner pointers after finding a valid triplet.
2. **Frontend**: Why does React Fiber maintain two trees (Double Buffering) instead of directly mutating the single current tree?
   * *Answer*: To prevent visual tearing or half-updated UI from painting on screen. The Work-in-Progress (WIP) tree is constructed asynchronously in memory and can be paused or aborted without affecting what the user sees. Once finished, React swaps the root pointer in one synchronous commit.
3. **Backend**: What is the difference between Minor GC (Scavenge) and Major GC (Mark-Sweep-Compact) in V8?
   * *Answer*: Minor GC operates only on the New Space (Young Generation) using Cheney's copying algorithm to rapidly discard short-lived objects in 1-2ms. Major GC runs on the Old Space when it fills up, performing full graph marking, sweeping dead objects, and memory compaction, causing a longer Stop-The-World pause.
4. **DevOps**: Why should you never use `CMD ["npm", "start"]` as the main process in a Docker container?
   * *Answer*: `npm` does not forward OS signals (`SIGTERM`, `SIGINT`) to child processes. When orchestrators stop a container, the Node.js process never receives the signal, cannot execute graceful shutdown routines, and is forcefully killed via `SIGKILL`.
5. **AI**: What is the mathematical and architectural reason why Chain-of-Thought (CoT) prompting drastically improves LLM accuracy?
   * *Answer*: LLMs generate tokens auto-regressively. When forced to produce intermediate reasoning steps, the generated reasoning tokens become part of the context window, allowing the self-attention heads to attend to those intermediate steps when generating the final answer.

---

## 💻 Part 2: Hands-On Homework Challenge

1. **Implement `threeSum` in TypeScript** without looking at the solution:
   * Input: `nums = [-1, 0, 1, 2, -1, -4]`
   * Expected Output: `[[-1, -1, 2], [-1, 0, 1]]`
   * Confirm that no duplicate triplets are produced.
2. **Review your Docker knowledge**:
   * Inspect any project you have worked on. Does it copy `package.json` before copying source code? Does it run as an unprivileged user? If not, refactor it using the Day 2 Dockerfile template.
