# Day 8: Data Structures & Algorithms (DSA)

---

## 1. 2D Array & Matrix Memory Mechanics

In physical hardware, Random Access Memory is a 1-dimensional array of addresses. A 2D matrix `matrix[rows][cols]` is mapped to 1D RAM using **Row-Major Order**:

$$\text{Address}(r, c) = \text{BaseAddress} + (r \times \text{TotalCols} + c) \times \text{ElementSize}$$

In JavaScript/V8, a matrix is an **array of references to other arrays**. Cache locality is maximized when iterating row-by-row (left to right) rather than jumping column-by-column.

---

## 2. LeetCode Problems: ALL Approaches Solved

---

### Problem 1: Rotate Image 90 Degrees Clockwise (LeetCode 48)
> **Problem Statement**: You are given an $n \times n$ 2D matrix representing an image. Rotate the image by 90 degrees (clockwise) **in-place**. You cannot allocate another 2D matrix. Space complexity must be $O(1)$.

#### Approach 1: Extra Matrix Buffer ($O(N^2)$ Space)
* Create `newMatrix[c][n - 1 - r] = matrix[r][c]`. Violates the strict $O(1)$ in-place constraint.

#### Approach 2: Transpose + Horizontal Reverse (Optimal $O(N^2)$ Time, $O(1)$ Space)
* **The Elegant Mathematical Transformation**:
  $$\text{90-Degree Clockwise Rotation} = \text{Transpose Matrix} \circ \text{Reverse Each Row}$$
* **Step 1: Transpose the Matrix**:
  * Swap elements across the main diagonal: swap `matrix[i][j]` with `matrix[j][i]` for all $j > i$.
  * Rows become columns, columns become rows.
* **Step 2: Reverse Every Row Horizontally**:
  * For each row, use Two Pointers to swap `row[left]` with `row[right]`.

```typescript
function rotate(matrix: number[][]): void {
  const n = matrix.length;

  // Step 1: Transpose the matrix across the main diagonal
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }

  // Step 2: Reverse each row horizontally
  for (let i = 0; i < n; i++) {
    let left = 0;
    let right = n - 1;
    while (left < right) {
      const temp = matrix[i][left];
      matrix[i][left] = matrix[i][right];
      matrix[i][right] = temp;
      left++;
      right--;
    }
  }
}
// Time Complexity: O(N^2) — Each element visited twice.
// Space Complexity: O(1) — Mutated entirely in-place.
```

---

### Problem 2: Spiral Matrix (LeetCode 54)
> **Problem Statement**: Given an $m \times n$ `matrix`, return all elements of the matrix in spiral order.

#### Optimal Solution: 4-Boundary Squeezing Simulation ($O(M \cdot N)$ Time, $O(1)$ Extra Space)
Maintain four boundary markers: `top = 0`, `bottom = m - 1`, `left = 0`, `right = n - 1`.

```typescript
function spiralOrder(matrix: number[][]): number[] {
  const result: number[] = [];
  if (matrix.length === 0) return result;

  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // 1. Traverse from left to right along top boundary
    for (let col = left; col <= right; col++) {
      result.push(matrix[top][col]);
    }
    top++; // Squeeze top boundary down

    // 2. Traverse from top to bottom along right boundary
    for (let row = top; row <= bottom; row++) {
      result.push(matrix[row][right]);
    }
    right--; // Squeeze right boundary left

    // 3. Traverse from right to left along bottom boundary (Check top <= bottom)
    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        result.push(matrix[bottom][col]);
      }
      bottom--; // Squeeze bottom boundary up
    }

    // 4. Traverse from bottom to top along left boundary (Check left <= right)
    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        result.push(matrix[row][left]);
      }
      left++; // Squeeze left boundary right
    }
  }

  return result;
}
```

---

### Problem 3: Set Matrix Zeroes (LeetCode 73)
> **Problem Statement**: Given an $m \times n$ integer matrix, if an element is `0`, set its entire row and column to `0`'s in-place. Must use $O(1)$ space.

#### Optimal Solution: Using Row 0 and Col 0 as State Markers ($O(M \cdot N)$ Time, $O(1)$ Space)
Instead of allocating external arrays to remember which rows/cols need to be zeroed, **use the first row and column of the matrix itself** as the record markers!

```typescript
function setZeroes(matrix: number[][]): void {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let rowZeroHasZero = false;
  let colZeroHasZero = false;

  // 1. Check if first row contains any zeroes
  for (let c = 0; c < cols; c++) {
    if (matrix[0][c] === 0) rowZeroHasZero = true;
  }

  // 2. Check if first col contains any zeroes
  for (let r = 0; r < rows; r++) {
    if (matrix[r][0] === 0) colZeroHasZero = true;
  }

  // 3. Use first row and column as flags for the rest of the matrix
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0;
        matrix[0][c] = 0;
      }
    }
  }

  // 4. Zero out cells based on flags in row 0 and col 0
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) {
        matrix[r][c] = 0;
      }
    }
  }

  // 5. Zero out first row if needed
  if (rowZeroHasZero) {
    for (let c = 0; c < cols; c++) matrix[0][c] = 0;
  }

  // 6. Zero out first col if needed
  if (colZeroHasZero) {
    for (let r = 0; r < rows; r++) matrix[r][0] = 0;
  }
}
```
