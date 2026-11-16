**Key insight:** match prefixes against prefixes. Letters and `?` must consume exactly one character on each side; a `*` either disappears (matches nothing) or swallows one more character of `s` while staying available.

## Approach

- **State:** `match[i][j]` = `s[0 … i-1]` matches `p[0 … j-1]`.
- **Recurrence** on the last pattern character `pc = p[j-1]`:
  - `pc === '*'` → `match[i][j] = match[i][j-1]` (star is empty) `|| match[i-1][j]` (star eats `s[i-1]`, `i > 0`).
  - otherwise → `match[i][j] = match[i-1][j-1] && (pc === '?' || pc === s[i-1])`.
- **Base cases:** `match[0][0] = true`; `match[0][j]` is true only while `p[0 … j-1]` is all `*`; `match[i > 0][0] = false`.
- **Order:** `i` increasing, `j` increasing. Answer `match[m][n]`.
- **Space optimisation:** row `i` reads row `i - 1` (`[j-1]`, `[j]`) and its own left cell, so two rows suffice.

The `match[i-1][j]` term is the trick: instead of trying every length for a `*` (an extra loop), let it eat one character at a time and stay on the same `j`.

Progression: the plain recursion tries every split for every `*` — exponential with many stars; memoise on `(i, j)`; tabulate; keep two rows.

## Complexity

- Time `O(m · n)`.
- Space `O(n)`.

## Alternatives to mention

- **Greedy with backtracking to the last star:** walk both strings; on a `*`, remember its position and the current `s` index; on a mismatch, jump back to just after the last `*` and let it absorb one more character. `O(1)` space and usually fast, `O(m · n)` worst case. Elegant, but harder to prove correct on the spot.
- Collapse runs of consecutive `*` first — they're equivalent to one.

## Pitfalls

- Treating `*` like regex `*` (repeat the previous character) — here it stands alone.
- Forgetting the leading-stars base row: `s = ""`, `p = "**"` must be `true`.
- Partial matches don't count; the answer is the bottom-right cell, not "any cell in the last row".
