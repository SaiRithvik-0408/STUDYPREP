# Day 7: Modern AI & Building an In-Memory Vector Search Engine

Before using third-party hosted vector databases like Pinecone, Weaviate, or pgvector, every senior AI engineer must understand how vector indexing and Top-$K$ semantic retrieval work from first principles.

---

## 1. The Vector Search Architecture

```
User Search Query: "How do I reset my password?"
                       │
                       ▼
             [ Embedding Model ]
                       │
                       ▼
             [ Query Vector: 768 floats ]
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│            IN-MEMORY VECTOR STORE                      │
│                                                        │
│  Doc 1: "Account Recovery & Passwords"  (Score: 0.94)  │ ──► Match 1
│  Doc 2: "Two-Factor Authentication"     (Score: 0.81)  │ ──► Match 2
│  Doc 3: "Pricing & Billing Tiers"       (Score: 0.12)  │
│  Doc 4: "Shipping & Return Policies"    (Score: 0.04)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Complete Vector Store Implementation in TypeScript

```typescript
import { VectorMath } from '../../d6/ai/06-vector-embeddings-and-cosine-similarity';

export interface DocumentRecord {
  id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: DocumentRecord;
  similarityScore: number;
}

export class InMemoryVectorStore {
  private documents: DocumentRecord[] = [];

  /**
   * Add a document along with its precomputed embedding vector
   */
  async addDocument(doc: DocumentRecord): Promise<void> {
    this.documents.push(doc);
  }

  /**
   * Add multiple documents in batch
   */
  async addDocuments(docs: DocumentRecord[]): Promise<void> {
    this.documents.push(...docs);
  }

  /**
   * Retrieve the top-K most semantically similar documents
   */
  similaritySearch(queryVector: number[], topK = 3): SearchResult[] {
    if (this.documents.length === 0) return [];

    // Step 1: Calculate cosine similarity score for every stored document
    const scoredResults: SearchResult[] = this.documents.map((doc) => {
      const score = VectorMath.cosineSimilarity(queryVector, doc.embedding);
      return { document: doc, similarityScore: score };
    });

    // Step 2: Sort descending by similarity score
    scoredResults.sort((a, b) => b.similarityScore - a.similarityScore);

    // Step 3: Return top K results
    return scoredResults.slice(0, topK);
  }

  /**
   * Get total document count
   */
  count(): number {
    return this.documents.length;
  }
}

// Verification Test:
const store = new InMemoryVectorStore();

// Adding mock vectors (3-dimensional for visualization):
store.addDocument({
  id: 'doc-1',
  content: 'To reset your password, visit account settings and click security.',
  embedding: [0.9, 0.1, 0.05],
});

store.addDocument({
  id: 'doc-2',
  content: 'Enterprise subscriptions cost $49 per user per month.',
  embedding: [0.05, 0.95, 0.1],
});

// Searching with a query vector close to doc-1:
const queryVec = [0.88, 0.12, 0.02];
const topMatches = store.similaritySearch(queryVec, 1);

console.log('Top Match:', topMatches[0].document.content);
console.log('Similarity Score:', topMatches[0].similarityScore.toFixed(4));
```
