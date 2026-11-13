# Day 11: Modern AI & Vector Indexing Internals (HNSW Graphs)

Comparing a query vector against 10,000,000 documents using brute-force Cosine Similarity (Flat Index) takes 5 seconds per query. **HNSW (Hierarchical Navigable Small World)** graphs achieve sub-5ms search in billions of vectors.

---

## 1. The HNSW Multi-Layer Skip-List Graph

```
Layer 2 (Express Sparse Links):    (A) ════════════════════════════► (Z)
                                    │                                 │
Layer 1 (Medium Granularity):      (A) ════════► (M) ═══════════════► (Z)
                                    │             │                   │
Layer 0 (Dense Nearest Neighbors): (A) ──► (C) ──► (M) ──► (P) ──► (T) ──► (Z)
```

1. **Top Layer**: Contains very few nodes with long-distance links. Query rapidly traverses wide semantic distances.
2. **Bottom Layer**: Contains all vectors with tight local nearest-neighbor connections.
3. **Complexity**: Drops search from $O(N \cdot D)$ down to **$O(\log N \cdot D)$**!