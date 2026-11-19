**Key idea:** let `dist[i][j]` be the fewest edits that turn the first `i` characters of `word1` into the first `j` characters of `word2`. Look at the last characters. If they are equal, they need no edit: `dist[i − 1][j − 1]`. Otherwise the last operation was a **replace** (`dist[i − 1][j − 1] + 1`), a **delete** of `word1`'s last character (`dist[i − 1][j] + 1`) or an **insert** of `word2`'s last character (`dist[i][j − 1] + 1`). Take the cheapest.

## Recognising the pattern

Transforming one sequence into another with per-character operations is the two-prefix table from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet, the same grid as [Longest Common Subsequence](/problems/longest-common-subsequence) with three moves instead of two.

## Alternative: memoised recursion over suffixes (shown below)

`cost(i, j)` = fewest edits to turn `word1[i..]` into `word2[j..]`. When one word runs out, the rest of the other must be inserted or deleted. Otherwise match for free, or try the three operations. With a memo table each `(i, j)` is solved once. That is the reference brute force below: `O(m · n)`, recursion depth `m + n`. Without the memo, the three-way branching is exponential.

## Bottom-up table

1. Size `(m + 1) × (n + 1)`.
2. Borders: `dist[i][0] = i` (delete everything), `dist[0][j] = j` (insert everything).
3. For `i` from 1 to `m`, `j` from 1 to `n`:
   - Equal characters: `dist[i][j] = dist[i − 1][j − 1]`.
   - Otherwise: `1 + min(dist[i − 1][j − 1], dist[i − 1][j], dist[i][j − 1])`.
4. Return `dist[m][n]`.

Each cell's three neighbours are the three operations:

```
dist[i-1][j-1]   dist[i-1][j]
     replace  ↘    ↓ delete
dist[i][j-1] → dist[i][j]
     insert
```

## Walkthrough

`word1 = "flaw"` (rows), `word2 = "lawn"` (columns).

|  | "" | l | a | w | n |
| --- | --- | --- | --- | --- | --- |
| "" | 0 | 1 | 2 | 3 | 4 |
| f | 1 | 1 | 2 | 3 | 4 |
| l | 2 | **1** | 2 | 3 | 4 |
| a | 3 | 2 | **1** | 2 | 3 |
| w | 4 | 3 | 2 | **1** | 2 |

Bold cells are matches, copied from the diagonal. The last cell: `w ≠ n`, so `1 + min(2, 3, 1) = 2`, from the insert neighbour. Answer `2`: delete `f`, insert `n`.

## Complexity

- Plain recursion: `O(3^(m + n))`.
- Memoised recursion or table: `O(m · n)` time and space.
- Two rows: `O(n)` space; keep the diagonal value from the previous row in a variable before overwriting it.

## Edge cases

- One word empty: the other's length.
- Identical words: 0.
- No characters in common: the longer length (replace the overlap, insert or delete the rest).

## Common mistakes

- Forgetting the borders, or setting them to 0.
- Adding 1 on a match.
- In the two-row version, reading the diagonal after it has been overwritten.

## In the interview

- Name the three operations and point to the neighbour each comes from; the code follows directly.
- Likely follow-ups:
  - *Return the edits?* Walk back from `(m, n)`, following the neighbour that produced each value.
  - *Different costs per operation?* Replace the `+ 1`s with those costs.
  - *Only insert and delete?* `m + n − 2 · LCS`.
  - *Is the distance at most 1 (One Edit Distance)?* A linear two-pointer scan, no table needed.
