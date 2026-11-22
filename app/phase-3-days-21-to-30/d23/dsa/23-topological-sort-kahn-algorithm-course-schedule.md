# Day 23: Data Structures & Algorithms (DSA)

---

## 1. Directed Acyclic Graphs (DAG) & Topological Sort
A **Topological Sort** of a directed graph is a linear ordering of vertices such that for every directed edge $u \to v$, vertex $u$ comes before $v$.
* Valid ONLY on **Directed Acyclic Graphs (DAG)**. If a cycle exists, topological sort is impossible!

---

## 2. Problem: Course Schedule I & II (LeetCode 207 / 210)
#### Optimal Solution: Kahn's Algorithm (In-Degree BFS) ($O(V + E)$ Time, $O(V + E)$ Space)
```typescript
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const inDegree: number[] = new Array(numCourses).fill(0);
  const adjList: Map<number, number[]> = new Map();

  // 1. Build graph & calculate in-degrees
  for (const [course, pre] of prerequisites) {
    if (!adjList.has(pre)) adjList.set(pre, []);
    adjList.get(pre)!.push(course);
    inDegree[course]++;
  }

  // 2. Enqueue courses with zero prerequisites (in-degree == 0)
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let completedCourses = 0;

  // 3. Process BFS
  while (queue.length > 0) {
    const curr = queue.shift()!;
    completedCourses++;

    const neighbors = adjList.get(curr) || [];
    for (const nextCourse of neighbors) {
      inDegree[nextCourse]--;
      if (inDegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return completedCourses === numCourses;
}
```