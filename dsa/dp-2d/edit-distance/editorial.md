**Key insight:** look at the last characters of the two prefixes. Equal → they cost nothing, drop both. Different → the last operation was a replace, a delete or an insert, and each leaves a smaller prefix pair to solve optimally.

## Approach

- **State:** `dp[i][j]` = minimum edits to turn `word1[0 … i-1]` into `word2[0 … j-1]`.
- **Recurrence:**
  - `word1[i-1] === word2[j-1]` → `dp[i][j] = dp[i-1][j-1]`
  - otherwise → `dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])` — replace, delete from `word1`, insert into `word1`.
- **Base cases:** `dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert everything).
- **Order:** `i` increasing, `j` increasing. Answer `dp[m][n]`.
- **Space optimisation:** each cell reads the previous row (`dp[i-1][j-1]`, `dp[i-1][j]`) and its left neighbour, so keep two rows — or one row plus a saved diagonal.

Progression: the plain recursion tries three operations at every mismatch — `O(3^(m+n))`; memoise on `(i, j)`; tabulate with the padded row and column; two rows.

## Complexity

- Time `O(m · n)` — 250k cells at the limits.
- Space `O(n)` with rolling rows.

## Alternatives to mention

- It's a shortest path on the `(i, j)` grid (free diagonal moves on matches, cost-1 moves otherwise) — 0-1 BFS or Dijkstra works but is no faster.
- Reconstructing the actual edit script needs the full table; walk back from `(m, n)`.

## Pitfalls

- On a match, don't take `min` with the other options plus 1 — skipping is always at least as good, so the plain diagonal is correct (and clearer).
- Mixing up which neighbour means insert vs delete is harmless for the count but matters when reconstructing the script.
- Forgetting the base row/column: transforming to or from an empty string is not free.
