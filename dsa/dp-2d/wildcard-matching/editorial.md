**Key idea:** let `match[i][j]` say whether the first `i` characters of `s` match the first `j` of `p`. A letter or `?` must match `s[i − 1]` and leaves `match[i − 1][j − 1]`. A `*` either matches nothing (`match[i][j − 1]`) or also covers `s[i − 1]` (`match[i − 1][j]`, staying on the same star so it can keep growing).

## Recognising the pattern

A pattern against a string, one position each, is the two-prefix table from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. Unlike [Regular Expression Matching](/problems/regular-expression-matching), the `*` here stands alone and matches any sequence, including empty.

## Alternative: simulate the pattern as an automaton (shown below)

Keep a boolean array `active[k]`: "the first `k` pattern characters can match what has been read so far". For each character of `s`, a star stays active (it absorbs the character), and a letter or `?` that matches moves to `k + 1`. After each step, being in front of a star also means being past it, since a star can match nothing. That is the reference brute force below: the same `O(m · n)`, processing the pattern as a set of states. Plain backtracking over how much each star absorbs is exponential.

## Bottom-up table

1. `match[0][0] = true`.
2. Row 0: `match[0][j] = match[0][j − 1]` and `p[j − 1] = '*'`. Only a run of leading stars matches an empty `s`.
3. For `i` from 1 to `m`, `j` from 1 to `n`:
   - `*`: `match[i][j] = match[i][j − 1] || match[i − 1][j]`.
   - `?` or an equal letter: `match[i][j] = match[i − 1][j − 1]`.
   - Otherwise false.
4. Return `match[m][n]`.

## Walkthrough

`s = "bridge"` (rows), `p = "b*e"` (columns). T marks true cells.

|  | "" | b | * | e |
| --- | --- | --- | --- | --- |
| "" | T |  |  |  |
| b |  | T | T (empty) |  |
| r |  |  | T (absorb) |  |
| i |  |  | T |  |
| d |  |  | T |  |
| g |  |  | T |  |
| e |  |  | T | **T** |

The star absorbs `ridg`; the final `e` matches diagonally from `match[5][2]`. Answer `true`.

## Complexity

- Backtracking: exponential in the worst case.
- Table or state simulation: `O(m · n)` time; `O(m · n)` space, or `O(n)` with one row (or the state array).
- A greedy two-pointer method that remembers the last star runs in `O(m · n)` worst case and `O(1)` space; worth mentioning as the optimisation.

## Edge cases

- Empty `s`: true only if `p` is all stars.
- Empty `p`: true only if `s` is empty.
- Repeated stars (`a**b`): behave like one star; collapsing them first is a small speed-up.

## Common mistakes

- Forgetting row 0, so `"***"` fails to match `""`.
- Using `match[i − 1][j − 1]` for a star, which lets it match exactly one character.
- Confusing this `*` with the regular-expression `*`, which repeats the previous character.

## In the interview

- Contrast the two kinds of star early; it shows you read the problem carefully.
- Likely follow-ups:
  - *`O(1)` space?* The greedy two-pointer scan: on a mismatch, backtrack to the last star and let it absorb one more character.
  - *Match against many file names?* Compile the pattern once; the state-simulation version is the start of that.
