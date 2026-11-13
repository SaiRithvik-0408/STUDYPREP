# Day 27: System Design (HLD) — Designing TinyURL

---

## 1. Capacity & Scale Estimation
* 100 Million URLs generated per month.
* Read-to-Write ratio: 10:1 (1 Billion reads/month $\implies$ 400 reads/sec).
* URL length: 7 characters Base62 ($62^7 \approx 3.5 \text{ Trillion}$ unique URLs!).

---

## 2. High-Level Architecture
```
Client ──► [ Load Balancer ] ──► [ Web API ] ──► [ Redis Cache ]
                                     │ (Miss)
                                     ▼
                            [ PostgreSQL / Cassandra ]
```