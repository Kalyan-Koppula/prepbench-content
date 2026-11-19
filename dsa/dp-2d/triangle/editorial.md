**Key idea:** work from the bottom up. The cheapest path from any position to the bottom is its own value plus the cheaper of the two positions below it. Start with the bottom row as it is, fold each row above into it, and the apex ends up holding the answer. One array of the bottom row's size is enough.

## Recognising the pattern

A path from top to bottom where each step goes to one of two adjacent positions, minimising the sum, is grid DP on a triangular grid ([2-D Dynamic Programming](/problems/patterns/dp-2d)). Going bottom-up avoids special cases: every position has exactly two children, while going top-down the edge positions have only one parent.

## Alternative: top-down by rows (shown below)

`best[i][j]` = cheapest path from the apex to `(i, j)`. Position `(i, j)` can be reached from `(i − 1, j − 1)` or `(i − 1, j)`, when those exist. Fill row by row, then take the minimum of the last row. That is the reference brute force below. `O(n²)` time and space, with edge checks that the bottom-up version doesn't need.

Trying every path is `2^(n − 1)` paths.

## Bottom-up with one array

1. `below` = a copy of the last row.
2. For `i` from the second-to-last row up to 0, for `j` from 0 to `i`: `below[j] = triangle[i][j] + min(below[j], below[j + 1])`.
3. Return `below[0]`.

**Why the overwrite is safe.** When updating `below[j]`, you read `below[j]` and `below[j + 1]`, both still from the row below. Moving `j` left to right, `below[j + 1]` hasn't been overwritten yet when `below[j]` is computed.

**Why greedy fails.** Taking the smaller child at each step can lead into a branch with huge values further down. The DP looks at every complete path's cost implicitly.

## Walkthrough

`triangle = [[3], [6, 5], [1, 8, 2], [4, 1, 9, 7]]`

| after row | below |
| --- | --- |
| start (row 3) | 4, 1, 9, 7 |
| row 2 | 1 + min(4, 1) = 2, 8 + min(1, 9) = 9, 2 + min(9, 7) = 9 |
| row 1 | 6 + min(2, 9) = 8, 5 + min(9, 9) = 14 |
| row 0 | 3 + min(8, 14) = 11 |

Answer `11`: 3 → 6 → 1 → 1. Greedy would choose 5 at the second row and end at 3 + 5 + 2 + 7 = 17.

## Complexity

- All paths: `O(2^n)`.
- Top-down table: `O(n²)` time and space.
- Bottom-up array: `O(n²)` time (every element is visited once), `O(n)` space.

## Edge cases

- One row: its only value.
- Negative values: no special handling; the DP still minimises correctly.
- All equal values: every path ties.

## Common mistakes

- Greedy choice of the smaller child.
- Top-down without the edge checks, reading `best[i − 1][i]`, which doesn't exist.
- Modifying the input triangle in place without saying so.

## In the interview

- Explain why bottom-up is cleaner (two children everywhere, answer at a single cell).
- Likely follow-ups:
  - *Return the path?* Record which child was chosen at each position, then walk down from the apex.
  - *Maximum instead of minimum?* Swap `min` for `max`.
  - *`O(1)` extra space?* Overwrite the triangle itself, if modifying the input is allowed.
