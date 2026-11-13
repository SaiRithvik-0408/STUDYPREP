# Day 8: Matrix Traversal, Next.js 15 App Router & RSCs, Enterprise Auth & RAG Pipelines

Welcome to Day 8. Today we master 2D array and matrix manipulation in $O(1)$ space, dissect Next.js 15 Server Components (RSC) and the client boundary, implement the industry-standard Access Token + Refresh Token dual-cookie auth architecture, orchestrate multi-environment Docker setups, and build our first end-to-end RAG (Retrieval-Augmented Generation) pipeline.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | File Path | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/08-matrices-and-2d-array-manipulation.md`](./dsa/08-matrices-and-2d-array-manipulation.md) | 2 Hours | 2D Arrays & Matrices: Rotate Image (Transpose + Reverse), Spiral Matrix, Set Matrix Zeroes ($O(1)$ Space). |
| **Backend** | [`be/08-authentication-jwt-refresh-tokens-cookies.md`](./be/08-authentication-jwt-refresh-tokens-cookies.md) | 1 Hour | Enterprise Auth: Short-lived Access Tokens + HttpOnly Refresh Token Cookies, XSS & CSRF defense. |
| **Frontend** | [`fe/08-nextjs-app-router-rsc-vs-client.md`](./fe/08-nextjs-app-router-rsc-vs-client.md) | 1 Hour | Next.js 15 App Router: Server Components (RSC) vs Client Components, Serialization boundaries, Streaming Suspense. |
| **Docker** | [`docker/08-docker-compose-production-overrides.md`](./docker/08-docker-compose-production-overrides.md) | 30 Mins | Multi-Stage Compose: `docker-compose.yml` base + `docker-compose.prod.yml` environment overrides. |
| **AI** | [`ai/08-rag-fundamentals-chunking-and-retrieval.md`](./ai/08-rag-fundamentals-chunking-and-retrieval.md) | 30 Mins | RAG Architecture: Document Chunking (Recursive splitting), Context Injection, and Grounded Answers. |
| **Others** | [`others/08-auth-and-matrix-drills.md`](./others/08-auth-and-matrix-drills.md) | 30 Mins | Day 8 verification quiz, security audit checklist, and matrix homework. |

---

## 🎯 Day 8 Mastery Checklist
- [ ] Rotate an $N \times N$ matrix 90 degrees clockwise in-place with zero extra memory ($O(1)$ space).
- [ ] Traverse a matrix in spiral order using 4 boundary pointers.
- [ ] Explain why React Server Components ship zero bytes of JavaScript to the browser client.
- [ ] Implement secure authentication using HttpOnly, Secure, SameSite cookies to eliminate XSS token theft.
- [ ] Configure Docker Compose overrides separating local dev bind mounts from production hardened containers.
- [ ] Build a working RAG script that chunks text, performs semantic search, and generates grounded LLM responses.
