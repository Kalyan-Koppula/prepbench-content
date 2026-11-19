**Key idea:** in any full parenthesisation of matrices `i..j`, there is a **last** multiplication, which splits the chain after some matrix `k` into `(i..k)` and `(k+1..j)`. Its cost is the product of the three outer dimensions, plus the best cost of each side. Try every `k` and keep the cheapest: `cost[i][j] = min over k of cost[i][k] + cost[k+1][j] + dims[i] · dims[k+1] · dims[j+1]`.

## Recognising the pattern

The order of operations changes the cost but not the result, and the choice splits a range into two independent subranges. That is interval DP from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. [Burst Balloons](/problems/burst-balloons) uses the same structure.

## Alternative: top-down recursion (shown below)

`cheapest(i, j)` tries every split `k`, recursing on both halves, memoised on `(i, j)`. That is the reference brute force below. Without memoisation the number of parenthesisations grows like the Catalan numbers (about `4^n`).

## Interval table

1. Matrix `i` has shape `dims[i] × dims[i + 1]`; there are `n = dims.length − 1` matrices.
2. `cost[i][i] = 0`: one matrix needs no multiplication.
3. For `length` from 2 to `n`, for each start `i` with `j = i + length − 1`:
   - `cost[i][j] = min over k in [i, j) of cost[i][k] + cost[k + 1][j] + dims[i] · dims[k + 1] · dims[j + 1]`.
4. Return `cost[0][n − 1]`.

**Where the product comes from.** The left part's result is `dims[i] × dims[k + 1]` and the right part's is `dims[k + 1] × dims[j + 1]`. Multiplying an `a × b` matrix by a `b × c` matrix takes `a · b · c` scalar multiplications.

## Walkthrough

`dims = [2, 3, 4, 5]`: matrices `2×3`, `3×4`, `4×5`.

| range | splits | cost |
| --- | --- | --- |
| (0, 1) | k = 0: 2·3·4 = 24 | 24 |
| (1, 2) | k = 1: 3·4·5 = 60 | 60 |
| (0, 2) | k = 0: 0 + 60 + 2·3·5 = 90; k = 1: 24 + 0 + 2·4·5 = 64 | **64** |

Answer `64`: `(M0 · M1) · M2`.

## Complexity

- All parenthesisations: exponential (Catalan numbers).
- Interval DP: `O(n³)` time, `O(n²)` space.

## Edge cases

- One matrix: 0.
- Two matrices: a single product, no choice.
- Dimensions of 1: they make some orders dramatically cheaper (`[10, 1, 10, 1]`: 20 versus 200).

## Common mistakes

- Off-by-one with dimension indices: the split cost uses `dims[k + 1]`, not `dims[k]`.
- Filling by `i` ascending instead of by length.
- Greedily multiplying the cheapest adjacent pair first, which isn't optimal in general.

## In the interview

- State the shape convention (`dims[i] × dims[i + 1]`) first; most bugs come from it.
- Likely follow-ups:
  - *Print the parenthesisation?* Store the best `k` per range and build the string recursively.
  - *Related problems?* Burst Balloons, Minimum Cost to Cut a Stick, Minimum Score Triangulation of a Polygon.
