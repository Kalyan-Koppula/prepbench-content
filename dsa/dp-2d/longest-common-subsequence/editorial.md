**Key insight:** look at the last characters of the two prefixes. If they match, they can close the common subsequence together; if not, at least one of them isn't used, so drop it and take the better of the two options.

## Approach

- **State:** `dp[i][j]` = LCS length of `text1[0 … i-1]` and `text2[0 … j-1]` (prefix lengths `i` and `j`).
- **Recurrence:**
  - `text1[i-1] === text2[j-1]` → `dp[i][j] = dp[i-1][j-1] + 1`
  - otherwise → `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
- **Base cases:** row `0` and column `0` are `0` — an empty prefix shares nothing.
- **Order:** `i` increasing, `j` increasing. Answer `dp[m][n]`.
- **Space optimisation:** row `i` reads row `i - 1` (`prev[j]`, `prev[j-1]`) and its own left cell, so two rows suffice. Put the shorter string on the row axis for `O(min(m, n))`. (One row plus a saved diagonal variable also works.)

Progression: recursion on `(i, j)` branches twice on every mismatch — `O(2^(m+n))`; memoise on `(i, j)`; tabulate with the padded row/column; drop to two rows.

## Complexity

- Time `O(m · n)` — one constant-time cell each.
- Space `O(min(m, n))` with rolling rows.

## Follow-ups

- **Reconstruct the subsequence:** keep the full table and walk back from `(m, n)`: diagonal on a match, otherwise towards the larger neighbour.
- Related: shortest common supersequence `= m + n - LCS`; minimum deletions to make strings equal `= m + n - 2·LCS`; longest palindromic subsequence `= LCS(s, reverse(s))`.

## Pitfalls

- On a match, taking `max(dp[i-1][j], dp[i][j-1]) + 1` double-counts a character.
- Confusing subsequence (gaps allowed) with substring (contiguous — that one resets to `0` on mismatch).
