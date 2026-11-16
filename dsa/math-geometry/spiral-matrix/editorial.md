**Key insight:** maintain the unvisited region as a rectangle `[top..bottom] x [left..right]`; each edge you walk shrinks one side by one.

## Approach

1. Walk the top row `left → right`, then `top++`.
2. Walk the right column `top → bottom`, then `right--`.
3. If rows remain (`top <= bottom`), walk the bottom row `right → left`, then `bottom--`.
4. If columns remain (`left <= right`), walk the left column `bottom → top`, then `left++`.
5. Repeat while the rectangle is non-empty.

The guards in steps 3–4 matter when the remaining region is a single row or column; without them, those cells are read twice.

## Complexity

- Time `O(m · n)` — each cell is output once.
- Space `O(1)` beyond the output array.

## Alternatives to mention

- Direction simulation: move in the current direction and turn right when the next cell is out of bounds or already visited. Simpler to get right, but needs an `m x n` visited grid (or overwriting cells with a sentinel).

## Pitfalls

- Non-square matrices: test `1 x n`, `m x 1`, and `3 x 2`.
- Re-checking only one boundary pair: both the row guard and the column guard are needed.
