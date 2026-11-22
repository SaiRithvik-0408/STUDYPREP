# Day 14: Data Structures & Algorithms (DSA)

---

## 1. The "Binary Search on Answer" Paradigm

When a problem asks for the **minimum possible maximum** or **maximum possible minimum** speed/capacity, and checking if a candidate answer $X$ is valid takes $O(N)$:
* If speed $X$ works, every speed $> X$ also works (Monotonic Predicate!).
* We binary search the **answer range** $[\text{low}, \text{high}]$ in $O(N \log(\text{Range}))$.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Koko Eating Bananas (LeetCode 875)
> **Problem Statement**: Koko loves to eat bananas. There are `n` piles of bananas, the `i`th pile has `piles[i]` bananas. The guards will come back in `h` hours. Return the minimum integer `k` such that she can eat all the bananas within `h` hours.

#### Optimal Solution: Binary Search on Speed ($O(N \log(\max(P)))$)
```typescript
function minEatingSpeed(piles: number[], h: number): number {
  let low = 1;
  let high = Math.max(...piles);
  let bestSpeed = high;

  function canFinish(speed: number): boolean {
    let totalHours = 0;
    for (const pile of piles) {
      totalHours += Math.ceil(pile / speed);
    }
    return totalHours <= h;
  }

  while (low <= high) {
    const midSpeed = Math.floor(low + (high - low) / 2);

    if (canFinish(midSpeed)) {
      bestSpeed = midSpeed; // Candidate found, try to find an even smaller speed
      high = midSpeed - 1;
    } else {
      low = midSpeed + 1; // Speed too slow, must increase
    }
  }

  return bestSpeed;
}
```