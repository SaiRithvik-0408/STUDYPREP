# Day 24: Data Structures & Algorithms (DSA)

---

## 1. Dijkstra's Algorithm ($O((V + E) \log V)$ Time)
Finds the shortest distance from a single source node to all other nodes in a weighted graph with **non-negative weights**:

```typescript
function dijkstra(n: number, edges: [number, number, number][], src: number): number[] {
  const adj = new Map<number, [number, number][]>();
  for (const [u, v, w] of edges) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push([v, w]);
  }

  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  // Min-Heap storing [distance, node]
  const pq: [number, number][] = [[0, src]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]); // Simple sort for illustration
    const [d, u] = pq.shift()!;

    if (d > dist[u]) continue;

    const neighbors = adj.get(u) || [];
    for (const [v, weight] of neighbors) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        pq.push([dist[v], v]);
      }
    }
  }

  return dist;
}
```