# Day 8: Drills, Quizzes & Practical Exercises

---

## 🧠 Part 1: Day 8 Concept Verification Quiz

Answer these 5 core questions:

1. **DSA**: In the "Rotate Image" problem, what is the two-step mathematical trick to rotate an $N \times N$ matrix 90 degrees clockwise in-place with $O(1)$ space?
   * *Answer*: First transpose the matrix (swap `matrix[i][j]` with `matrix[j][i]` across the main diagonal). Second, reverse each individual row horizontally from left to right.
2. **Backend**: Why is storing JWT access tokens in `localStorage` vulnerable to session hijacking, and how does the Dual-Token (HttpOnly cookie) pattern solve this?
   * *Answer*: Any Cross-Site Scripting (XSS) vulnerability allows malicious JavaScript to execute `localStorage.getItem('token')` and exfiltrate the token. The dual-token pattern keeps the access token in ephemeral memory and stores the refresh token in an `httpOnly` cookie, which the browser engine prevents client-side JavaScript from ever reading.
3. **Frontend**: Why do React Server Components (RSC) in Next.js 15 ship zero bytes of JavaScript to the browser client?
   * *Answer*: Server Components execute strictly on the Node.js server to fetch data and construct virtual UI trees. Next.js compiles the result into a lightweight virtual DOM stream (RSC Payload). Because Server Components never execute in the browser and require no client hydration, their component code and dependencies are completely omitted from the browser bundle.
4. **DevOps**: In Docker Compose, how does `docker-compose.override.yml` behave when running `docker compose up` versus running in production?
   * *Answer*: By default, `docker compose up` automatically discovers and merges `docker-compose.override.yml` on top of `docker-compose.yml`, applying local development bind mounts and debug ports. In production, you bypass the override by specifying explicit flags: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.
5. **AI**: Why is RAG (Retrieval-Augmented Generation) preferred over fine-tuning for dynamic corporate knowledge bases?
   * *Answer*: Fine-tuning modifies neural network weights through slow, expensive training runs and can still hallucinate outdated facts. RAG leaves model weights untouched and injects real-time, searchable document chunks directly into the prompt context at inference time, providing instant document updates and verifiable source citations.

---

## 💻 Part 2: Hands-On Homework Challenge

1. Implement `rotate` (LeetCode 48) in TypeScript and verify with a $3 \times 3$ matrix:
   * Input: `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]`
   * Expected: `[[7, 4, 1], [8, 5, 2], [9, 6, 3]]`
   * Confirm that no secondary arrays are allocated.
2. Review your Next.js application: Verify that data fetching happens inside Server Components (`async function Page()`) and that `'use client'` is only placed on leaf components that require interactivity.
