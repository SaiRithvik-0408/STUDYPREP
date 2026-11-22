# Day 8: Modern AI & RAG Fundamentals (Chunking & Retrieval-Augmented Generation)

LLMs hallucinate and have fixed knowledge cutoff dates. **Retrieval-Augmented Generation (RAG)** grounds the model in your enterprise's private documents, PDFs, and databases without expensive model fine-tuning.

---

## 1. Why RAG Beats Fine-Tuning for Enterprise Knowledge

```
┌────────────────────────────────────────────────────────┐
│                   FINE-TUNING                          │
├────────────────────────────────────────────────────────┤
│ - Modifies internal weights of the model               │
│ - Extremely expensive ($$$) and slow to train          │
│ - Bad for knowledge: model can still hallucinate facts │
│ - Cannot be revoked or deleted easily                  │
└────────────────────────────────────────────────────────┘
                           vs
┌────────────────────────────────────────────────────────┐
│             RAG (Retrieval-Augmented Generation)       │
├────────────────────────────────────────────────────────┤
│ - Leaves model weights untouched                       │
│ - Instant updates: add/delete documents in real time   │
│ - Zero hallucination: forces answers grounded in text  │
│ - Provides transparent source citations & page numbers │
└────────────────────────────────────────────────────────┘
```

---

## 2. The 3 Phases of a RAG Pipeline

```
PHASE 1: INGESTION (Offline / Periodic)
[ Enterprise PDF / Docs ] ──► [ Text Chunker ] ──► [ Embedding Model ] ──► [ Vector Database ]

PHASE 2: RETRIEVAL (Runtime)
[ User Question ] ──► [ Embedding Model ] ──► [ Similarity Search ] ──► [ Top-3 Text Chunks ]

PHASE 3: GENERATION (Runtime)
[ Prompt: System Rules + Top-3 Chunks + Question ] ──► [ LLM ] ──► [ Grounded Answer ]
```

---

## 3. Chunking Strategies: The Art of Context Windows

You cannot pass a 500-page book as a single vector. You must slice it into **chunks**:

### 1. Fixed Character Splitting (Naive):
* Slices every 500 characters.
* **Flaw**: Frequently cuts words in half or splits sentences, destroying semantic meaning.

### 2. Recursive Character Splitting with Overlap (Production Standard):
* Tries to split on paragraphs (`\n\n`), then sentences (`. `), then spaces.
* **Chunk Overlap (e.g. 15%)**: Ensures that concepts spanning two adjacent chunks retain their context!

```typescript
export function recursiveTextSplitter(
  text: string,
  chunkSize = 300,
  chunkOverlap = 50
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentWords: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length > chunkSize && currentWords.length > 0) {
      chunks.push(currentWords.join(' '));
      // Keep trailing overlap words for continuity
      const overlapWords = currentWords.slice(-Math.floor(chunkOverlap / 6));
      currentWords = [...overlapWords, word];
      currentLength = currentWords.join(' ').length;
    } else {
      currentWords.push(word);
      currentLength += word.length + 1;
    }
  }

  if (currentWords.length > 0) {
    chunks.push(currentWords.join(' '));
  }

  return chunks;
}
```

---

## 4. Grounded Prompt Injection

Once Top-$K$ chunks are retrieved from your vector store, stitch them into the prompt:

```typescript
export function buildRAGPrompt(retrievedChunks: string[], userQuestion: string): string {
  const contextBlock = retrievedChunks
    .map((chunk, idx) => `[Context Chunk ${idx + 1}]:\n${chunk}`)
    .join('\n\n');

  return `
You are a strict, grounded enterprise AI assistant.
Answer the user's question using EXCLUSIVELY the provided context below.

RULES:
1. Do not use outside knowledge.
2. If the answer cannot be found in the context, reply: "I do not have enough information in the provided documentation to answer that."
3. Cite which chunk number you used.

---
RELEVANT CONTEXT:
${contextBlock}
---

USER QUESTION: "${userQuestion}"

ANSWER:
`;
}
```
