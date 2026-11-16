**Key insight:** every bracketing has a *last* multiplication, which splits the chain at some `k` into two independent sub-chains. Try every `k` and reuse the best costs of the sub-chains — interval DP.

## Approach

- **State:** `cost[i][j]` = minimum scalar multiplications to compute `Mᵢ · … · Mⱼ`. That product has shape `dims[i] × dims[j + 1]`.
- **Recurrence:** `cost[i][j] = min over i ≤ k < j of cost[i][k] + cost[k+1][j] + dims[i] · dims[k+1] · dims[j+1]`.
- **Base cases:** `cost[i][i] = 0` — a single matrix needs no work.
- **Order:** by increasing chain length `len = j - i + 1`, so both sub-chains (shorter) are ready. Answer `cost[0][n-1]`.
- **Space:** the full `n × n` table is required — a cell reads sub-intervals of every length, so there's no rolling-row trick.

Progression: plain recursion over split points recomputes the same sub-chains — the number of bracketings is the Catalan number `C(n-1)`, exponential; memoising on `(i, j)` gives `O(n²)` states × `O(n)` splits; tabulate by length.

## Complexity

- Time `O(n³)`.
- Space `O(n²)`.

## Follow-ups

- **Print the bracketing:** store the best `k` in `split[i][j]` and recurse to build `"((M0M1)M2)"`.
- Same template: Burst Balloons (choose the last balloon), minimum cost to cut a stick, optimal BST, palindrome partitioning II.

## Pitfalls

- Off-by-one on shapes: with matrix `Mᵢ = dims[i] × dims[i+1]`, the merge cost uses `dims[i]`, `dims[k+1]`, `dims[j+1]`.
- Filling the table row by row (`i` ascending) reads `cost[k+1][j]` before it exists — iterate by length, or `i` descending.
- Greedy "multiply the cheapest adjacent pair first" is not optimal.
