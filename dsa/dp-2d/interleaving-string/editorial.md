**Key idea:** if `s3` interleaves `s1` and `s2`, then its first `i + j` characters interleave the first `i` of `s1` and the first `j` of `s2`, for some split. Let `ok[i][j]` say whether that prefix works. The last of those `i + j` characters came either from `s1` (so `ok[i − 1][j]` must hold and `s1[i − 1]` must equal it) or from `s2` (so `ok[i][j − 1]` and `s2[j − 1]`).

## Recognising the pattern

Two input strings consumed in some interleaved order is a two-prefix state from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. Greedy matching fails when both strings offer the same next character: the choice only becomes clear later.

## Alternative: search over states (shown below)

A state `(i, j)` means `i` characters used from `s1` and `j` from `s2`. From it you can advance in `s1` or in `s2` if that string's next character matches `s3[i + j]`. The answer is whether `(m, n)` is reachable from `(0, 0)`. A DFS with a visited array is the reference brute force below. Each of the `(m + 1)(n + 1)` states is visited once. Without the visited array, the search revisits states and becomes exponential.

## Bottom-up table

1. If `m + n ≠ s3.length`, return false.
2. `ok[0][0] = true`.
3. For each `(i, j)` in row-major order (except `(0, 0)`), with `next = s3[i + j − 1]`:
   - true if `i > 0`, `ok[i − 1][j]` and `s1[i − 1] = next`, or
   - true if `j > 0`, `ok[i][j − 1]` and `s2[j − 1] = next`.
4. Return `ok[m][n]`.

**One row is enough.** Row `i` reads the row above at the same column and the current row to the left, just like Unique Paths, so a single array updated left to right works.

## Walkthrough

`s1 = "ab"` (rows), `s2 = "cd"` (columns), `s3 = "acbd"`

|  | j = 0 | j = 1 (c) | j = 2 (d) |
| --- | --- | --- | --- |
| i = 0 | T | F (c ≠ a) | F |
| i = 1 (a) | T (a = a) | T (from left: c = c) | F (d ≠ b) |
| i = 2 (b) | F (b ≠ c) | T (from above: b = b) | T (from left: d = d) |

Answer `true`: a from `s1`, c from `s2`, b from `s1`, d from `s2`.

## Complexity

- Search without a visited set: exponential.
- Search with a visited array: `O(m · n)` time and space.
- Table: `O(m · n)` time; `O(m · n)` space, or `O(n)` with one row.

## Edge cases

- Lengths don't add up: false immediately.
- One string empty: `s3` must equal the other.
- All empty: true.
- Both strings share characters (`"aa"`, `"ab"`): the reason greedy fails.

## Common mistakes

- Skipping the length check, which lets `ok[m][n]` be read for a longer `s3`.
- Greedily taking from `s1` whenever it matches.
- Off-by-one on `s3[i + j − 1]`.

## In the interview

- Explain why a greedy pointer walk fails with an example like `s1 = "aab"`, `s2 = "aac"`.
- Likely follow-ups:
  - *Return one interleaving?* Walk back from `(m, n)` choosing whichever true neighbour produced each cell.
  - *Three source strings?* A 3-D table on `(i, j, k)`, with `s3` index `i + j + k`.
