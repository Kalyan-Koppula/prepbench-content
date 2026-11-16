**Key insight:** treat `x*` as one unit and look at the end of the pattern prefix. A plain character must match the last character of `s`; an `x*` either vanishes (zero copies) or — if `x` matches the last character — eats it and stays put for possibly more.

## Approach

- **State:** `match[i][j]` = `s[0 … i-1]` matches `p[0 … j-1]`.
- **Recurrence:** let `same(i, j)` mean `p[j-1]` is `.` or equals `s[i-1]`.
  - `p[j-1] === '*'` → `match[i][j] = match[i][j-2]` (zero copies of `p[j-2]`) `|| (i > 0 && same(i, j-1) && match[i-1][j])` (one more copy eats `s[i-1]`).
  - otherwise → `match[i][j] = i > 0 && same(i, j) && match[i-1][j-1]`.
- **Base cases:** `match[0][0] = true`; `match[i > 0][0] = false`. Row `i = 0` is computed by the same recurrence and is true only for patterns like `a*b*.*`.
- **Order:** `i` from `0`, `j` from `1`, both increasing. Answer `match[m][n]`.
- **Space optimisation:** each row reads only itself and the previous row, so two rows suffice — not worth the clarity cost at length 20, but mention it.

Progression: the natural recursion (match first char, then branch on `*` for zero/one-more) is exponential on patterns like `a*a*a*…c`; memoise on `(i, j)`; tabulate.

## Complexity

- Time `O(m · n)`.
- Space `O(m · n)` (or `O(n)` with two rows).

## Pitfalls

- Handling `*` by looking at `p[j]` (the next char) in a prefix formulation — in the prefix version you look *back* at `p[j-2]`.
- Forgetting row `0`: `s = ""` must still be able to match `a*b*`. (Here `s` is non-empty, but the empty-prefix row is still needed internally.)
- Mixing this up with wildcard matching, where `*` stands alone.
- In the `*` case keep the zero-copies option even when the characters match: `"aaa"` vs `"ab*a*c*a"` needs `b*` and `c*` to vanish, and `a*` must leave one `a` for the final literal.
