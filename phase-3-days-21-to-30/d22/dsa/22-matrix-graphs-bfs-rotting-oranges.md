# Day 22: Data Structures & Algorithms (DSA)

---

## 1. Multi-Source BFS: Rotting Oranges (LeetCode 994)
> Fresh oranges (`1`), rotten oranges (`2`), empty cells (`0`). Every minute, rotten oranges rot adjacent fresh oranges. Return minimum minutes until no fresh oranges remain.

```typescript
function orangesRotting(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: [number, number][] = [];
  let freshCount = 0;

  // 1. Enqueue all initially rotten oranges (Multi-source!)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) freshCount++;
    }
  }

  if (freshCount === 0) return 0;

  let minutes = 0;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // 2. BFS level by level
  while (queue.length > 0 && freshCount > 0) {
    const levelSize = queue.length;
    minutes++;

    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift()!;

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // Rots orange
          freshCount--;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return freshCount === 0 ? minutes : -1;
}
```