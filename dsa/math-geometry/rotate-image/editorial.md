**Key insight:** a clockwise rotation is a transpose followed by a horizontal flip — both are easy in-place swaps.

## Approach

1. Transpose: for every `i < j`, swap `matrix[i][j]` and `matrix[j][i]`.
2. Reverse each row.

Check on a corner: the top-left element `(0, 0)` stays at `(0, 0)` after the transpose and moves to `(0, n - 1)` — the top-right — after the flip. That's where clockwise rotation sends it.

## Complexity

- Time `O(n²)` — every cell is touched a constant number of times.
- Space `O(1)`.

## Alternatives to mention

- **Four-way cycle by layers:** for each ring and each offset, rotate the four corresponding cells with one temp variable. Same complexity, one pass, but more index arithmetic — some interviewers ask for it specifically.
- Counter-clockwise: transpose then reverse each column (or reverse rows top-to-bottom, then transpose).
- Copying into a new matrix is `O(n²)` extra space and violates the in-place requirement.

## Pitfalls

- Looping `j` from `0` in the transpose swaps every pair twice and undoes the work.
- Assigning a new array to `matrix` inside the function doesn't change the caller's matrix — mutate the rows.
