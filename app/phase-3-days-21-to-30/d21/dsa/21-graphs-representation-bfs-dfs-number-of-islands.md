# Day 21: Data Structures & Algorithms (DSA)

---

## 1. Graph Physical Memory Representation
1. **Adjacency Matrix**: 2D boolean array `matrix[u][v]`. Space: $O(V^2)$.
2. **Adjacency List**: Array / HashMap of neighbor lists `Map<number, number[]>`. Space: $O(V + E)$ (Industry standard!).

---

## 2. Problem: Number of Islands (LeetCode 200)
> Count contiguous regions of land (`'1'`) surrounded by water (`'0'`).

#### Optimal Solution: Multi-Source Grid DFS ($O(M \cdot N)$ Time, $O(M \cdot N)$ Space)
```typescript
function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;

    grid[r][c] = '0'; // Sink island to avoid extra visited set

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}
```