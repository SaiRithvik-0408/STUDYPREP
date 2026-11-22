# Day 25: Data Structures & Algorithms (DSA)

---

## 1. Union-Find Architecture ($O(\alpha(N)) \approx O(1)$ Amortized)
Used for cycle detection in undirected graphs and tracking connected components:

```typescript
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(i: number): number {
    // Path compression: points directly to root!
    if (this.parent[i] !== i) {
      this.parent[i] = this.find(this.parent[i]);
    }
    return this.parent[i];
  }

  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI === rootJ) return false; // Cycle detected!

    // Union by rank
    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI]++;
    }

    return true;
  }
}
```