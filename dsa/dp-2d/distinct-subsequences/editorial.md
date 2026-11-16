**Key insight:** decide the fate of the last character of `s`'s prefix: drop it, or — when it equals the last character of `t`'s prefix — match the two. The counts for the two choices add, because they keep different position sets.

## Approach

- **State:** `ways[i][j]` = number of ways to form `t[0 … j-1]` by deleting characters from `s[0 … i-1]`.
- **Recurrence:**
  - `ways[i][j] = ways[i-1][j]` (don't use `s[i-1]`)
  - `+ ways[i-1][j-1]` if `s[i-1] === t[j-1]` (match them).
- **Base cases:** `ways[i][0] = 1` for every `i` (delete everything to get the empty string); `ways[0][j > 0] = 0`.
- **Order:** `i` increasing (characters of `s`), then `j`. Answer `ways[m][n]`.
- **Space optimisation:** row `i` reads only row `i - 1`. In one array, sweep `j` from `n` **down** to `1`: `ways[j - 1]` then still holds the previous row's value. The "don't use" term is the unchanged `ways[j]` itself.

Progression: recursion `count(i, j)` with skip/match branches is exponential; memoise on `(i, j)`; tabulate with the `j = 0` column set to `1`; roll to one row.

## Complexity

- Time `O(m · n)`.
- Space `O(n)`.

## Pitfalls

- The "empty target" base case is `1`, not `0` — without it nothing ever gets counted.
- Sweeping `j` upward lets one character of `s` match two positions of `t` (`"a"`, `"aa"` would give `1`).
- Intermediate counts can dwarf the final answer (many ways to form a prefix of `t` that never complete). In fixed-width languages they overflow; in JS they lose precision past `2^53`. Mention a modulus or `BigInt` if the interviewer drops the "fits in 32 bits" guarantee.
- Early exit: if `t` is longer than `s`, the answer is `0`.
