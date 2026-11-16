**Key insight:** fix the balloon burst **last** inside a range, not first. When `k` is the last one left between two walls `l` and `r`, its neighbours are exactly those walls, and the balloons on each side were burst independently — so the range splits cleanly.

## Approach

1. Pad: `val = [1, ...nums, 1]`. Indices `0` and `n + 1` are walls that are never burst.
2. **State:** `best[l][r]` = most coins from bursting every balloon strictly between `l` and `r` (walls `l`, `r` still standing).
3. **Recurrence:** `best[l][r] = max over l < k < r of best[l][k] + val[l]·val[k]·val[r] + best[k][r]`.
4. **Base cases:** `best[l][l + 1] = 0` — nothing between adjacent walls.
5. **Order:** by increasing gap `r - l`, so both sub-ranges (shorter gaps) are ready. Answer `best[0][n + 1]`.
6. **Space:** interval DP needs the full table; no row-rolling trick, since a cell reads sub-ranges of every size.

Why "first" fails: if you burst `k` first, the left and right parts become neighbours of each other, so they are not independent subproblems.

Progression: trying all `n!` orders → memoise on the set of standing balloons (`2ⁿ` states — fine for 16, hopeless for 300) → the "last burst" insight reduces the state to an interval → `O(n²)` states × `O(n)` choices.

## Complexity

- Time `O(n³)` — about 4.5M inner steps at `n = 300`.
- Space `O(n²)`.

## Pitfalls

- Recursing on "first balloon to burst" with sub-arrays — exponential and not decomposable.
- Filling by `l` ascending instead of by gap reads `best[k][r]` before it's computed; iterate `l` **descending** if you prefer rows.
- Zeros need no special case. (Dropping them up front is also valid: a zero earns nothing, and bursting it first makes it as if it never existed.)
