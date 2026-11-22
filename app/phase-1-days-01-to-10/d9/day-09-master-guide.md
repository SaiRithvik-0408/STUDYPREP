# Day 9: Binary Search, Redis Caching Architecture, Next.js Server Actions, Nginx & Streaming UI

Welcome to Day 9. Today we master $O(\log N)$ Binary Search in rotated arrays, design Redis caching and distributed rate limiters, replace boilerplate APIs with Next.js 15 Server Actions, configure Nginx as a reverse proxy, and stream real-time LLM token responses to the browser.

---

## ⏱️ Daily Schedule Breakdown (~5 Hours)

| Section | File Path | Target Time | Focus Area |
| :--- | :--- | :--- | :--- |
| **DSA** | [`dsa/09-binary-search-fundamentals-and-rotated-arrays.md`](./dsa/09-binary-search-fundamentals-and-rotated-arrays.md) | 2 Hours | Binary Search: Classic Template, Search in Rotated Sorted Array, Find Minimum ($O(\log N)$). |
| **Backend** | [`be/09-redis-caching-strategies-and-rate-limiting.md`](./be/09-redis-caching-strategies-and-rate-limiting.md) | 1 Hour | Redis Architecture: In-Memory Datatypes, Cache-Aside Pattern, Cache Stampede Defense, Sliding Window Rate Limiting. |
| **Frontend** | [`fe/09-server-actions-and-optimistic-mutations.md`](./fe/09-server-actions-and-optimistic-mutations.md) | 1 Hour | Next.js 15 Server Actions: `'use server'`, `useActionState`, `useOptimistic` for instant UI feedback. |
| **Docker** | [`docker/09-nginx-reverse-proxy-and-ssl-termination.md`](./docker/09-nginx-reverse-proxy-and-ssl-termination.md) | 30 Mins | Nginx Reverse Proxy: SSL/TLS Termination, Load Balancing (Round-Robin/Least Connections), Rate Limiting. |
| **AI** | [`ai/09-streaming-ui-and-vercel-ai-sdk.md`](./ai/09-streaming-ui-and-vercel-ai-sdk.md) | 30 Mins | Streaming AI Responses: Server-Sent Events (SSE), Chunked Transfer Encoding, Vercel AI SDK `useChat`. |
| **Others** | [`others/09-binary-search-and-caching-drills.md`](./others/09-binary-search-and-caching-drills.md) | 30 Mins | Day 9 verification quiz, binary search edge-case drills, and Redis benchmarks. |

---

## 🎯 Day 9 Mastery Checklist
- [ ] Implement Binary Search safely without integer overflow: `low + Math.floor((high - low) / 2)`.
- [ ] Solve Search in Rotated Sorted Array in $O(\log N)$ by identifying the strictly sorted half.
- [ ] Implement the Cache-Aside pattern with Redis and prevent Cache Stampedes using distributed mutexes.
- [ ] Build a Next.js 15 Server Action with `useOptimistic` to mutate data without waiting for network latency.
- [ ] Write an `nginx.conf` that reverse proxies traffic to multiple upstream Node.js containers.
- [ ] Stream real-time token responses from an LLM API to a React frontend using Server-Sent Events.
