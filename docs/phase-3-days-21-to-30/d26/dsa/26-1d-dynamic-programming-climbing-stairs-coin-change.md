# Day 26: Data Structures & Algorithms (DSA)

---

## 1. Dynamic Programming Mental Model
1. **Optimal Substructure**: The optimal solution to a problem contains within it optimal solutions to subproblems.
2. **Overlapping Subproblems**: The same subproblems are solved repeatedly (memoized via array or table).

---

## 2. Problem: Coin Change (LeetCode 322)
> Minimum coins needed to make amount $A$.

#### Optimal Solution: Bottom-Up Tabulation ($O(N \cdot A)$ Time, $O(A)$ Space)
```typescript
function coinChange(coins: number[], amount: number): number {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins to make amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}
```