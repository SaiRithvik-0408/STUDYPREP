# Day 13: Modern AI & Hybrid Search (BM25 + Vectors with RRF)

Pure vector search is great for conceptual meaning, but fails on exact keyword searches like serial numbers (`"TX-94812"`) or acronyms. **Hybrid Search** combines Sparse Lexical Search (BM25) with Dense Semantic Embeddings.

---

## 1. Reciprocal Rank Fusion (RRF) Formula

$$\text{RRF Score}(d) = \frac{1}{60 + \text{Rank}_{\text{BM25}}(d)} + \frac{1}{60 + \text{Rank}_{\text{Vector}}(d)}$$

Combining both rankings guarantees that documents matching both keyword and semantic meaning rank at the very top!