# Day 12: Modern AI & PostgreSQL pgvector

Instead of paying $1,000/month for hosted vector databases, you can store high-dimensional vectors directly inside PostgreSQL using the official **`pgvector`** extension.

---

## 1. Setting up pgvector in SQL

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL
);

CREATE INDEX idx_docs_hnsw ON document_embeddings 
USING hnsw (embedding vector_cosine_ops);

SELECT id, content, (1 - (embedding <=> '[0.12, -0.45, ...]'::vector)) AS similarity_score
FROM document_embeddings
ORDER BY embedding <=> '[0.12, -0.45, ...]'::vector
LIMIT 5;
```