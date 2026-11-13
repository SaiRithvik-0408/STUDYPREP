# Day 6: Modern AI & Vector Embeddings Math (Cosine Similarity)

To build modern semantic search engines, recommendation systems, and RAG (Retrieval-Augmented Generation) pipelines, you must understand the mathematical foundations of **Vector Embeddings**.

---

## 1. What is an Embedding? (Semantic Geometry)

Computers cannot understand the conceptual meaning of words. An **Embedding Model** transforms arbitrary text into an array of floating-point numbers (a vector in high-dimensional space, typically 768 or 1,536 dimensions):

```
"King"   ──► [ 0.231, -0.891, 0.412, ..., 0.051 ] (1536 floats)
"Queen"  ──► [ 0.228, -0.884, 0.409, ..., 0.048 ] (Extremely close in space!)
"Banana" ──► [ -0.712, 0.114, -0.923, ..., 0.812 ] (Far away in space!)
```

In this high-dimensional space:
$$\text{Vector("King")} - \text{Vector("Man")} + \text{Vector("Woman")} \approx \text{Vector("Queen")}$$

---

## 2. The Mathematics of Similarity

To determine how semantically similar two pieces of text are, we compute the angle $\theta$ between their vectors.

### 1. Cosine Similarity Formula:
$$\text{Cosine Similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \times \sqrt{\sum_{i=1}^{n} B_i^2}}$$

* **Result = $1.0$**: Vectors point in identical directions (identical semantic meaning).
* **Result = $0.0$**: Vectors are orthogonal (completely unrelated concepts).
* **Result = $-1.0$**: Vectors point in diametrically opposite directions.

---

## 3. Pure TypeScript Vector Math Engine

Here is a zero-dependency vector engine implementing normalized Dot Product and Cosine Similarity:

```typescript
export class VectorMath {
  /**
   * Computes the Dot Product of two vectors: sum(A[i] * B[i])
   */
  static dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error(`Dimension mismatch: Vector A (${a.length}) vs Vector B (${b.length})`);
    }

    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  /**
   * Computes the Euclidean Magnitude (L2 Norm): sqrt(sum(A[i]^2))
   */
  static magnitude(vec: number[]): number {
    let sumSquares = 0;
    for (let i = 0; i < vec.length; i++) {
      sumSquares += vec[i] * vec[i];
    }
    return Math.sqrt(sumSquares);
  }

  /**
   * Computes Cosine Similarity between two arbitrary dimensional vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    const dot = this.dotProduct(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);

    if (magA === 0 || magB === 0) return 0;

    return dot / (magA * magB);
  }
}

// Verification Test:
const vecQuery = [1, 2, 3];
const vecDoc1  = [2, 4, 6];     // Exactly identical direction (should be 1.0)
const vecDoc2  = [-1, -2, -3];  // Exactly opposite direction (should be -1.0)
const vecDoc3  = [3, -1, 0];    // Orthogonal / perpendicular

console.log(VectorMath.cosineSimilarity(vecQuery, vecDoc1)); // 1.0
console.log(VectorMath.cosineSimilarity(vecQuery, vecDoc2)); // -1.0
console.log(VectorMath.cosineSimilarity(vecQuery, vecDoc3)); // 0.07 (Near orthogonal)
```
