**Key idea:** let `match[i][j]` say whether the first `i` characters of `s` match the first `j` characters of `p`. An ordinary character or `.` must match `s[i − 1]` and leave `match[i − 1][j − 1]`. A `*` makes the pair `x*` one unit with two choices: use it **zero times** (`match[i][j − 2]`), or let it absorb `s[i − 1]` when `x` matches it and **stay on the same pattern position** (`match[i − 1][j]`).

## Recognising the pattern

Matching a string against a pattern, one position each, is the two-prefix table from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. The `*` is what makes simple pointer scanning fail: you don't know in advance how many characters it should take.

## Alternative: memoised recursion over suffixes (shown below)

`matches(i, j)` = `s[i..]` matches `p[j..]`. If the next pattern character is followed by `*`, either skip the pair (`j + 2`) or, if the first character matches, consume one character of `s` and stay on `j`. Otherwise the first characters must match and both advance. That is the reference brute force below, memoised on `(i, j)`. Without the memo, patterns like `a*a*a*a*b` against `aaaa…` take exponential time.

## Bottom-up table

1. `match[0][0] = true`. All other cells start false.
2. For `i` from 0 to `m` (row 0 matters: `a*b*` matches the empty string), for `j` from 1 to `n`:
   - If `p[j − 1] = '*'`:
     - `match[i][j] = match[i][j − 2]` (zero copies), or
     - if `i > 0` and `p[j − 2]` matches `s[i − 1]`: `match[i − 1][j]` (one more copy).
   - Else if `i > 0` and `p[j − 1]` matches `s[i − 1]` (equal or `.`): `match[i][j] = match[i − 1][j − 1]`.
3. Return `match[m][n]`.

**Why `match[i − 1][j]` and not `[i − 1][j − 2]`.** Staying on column `j` keeps `x*` available, so it can absorb any number of further characters. Each step up the column absorbs one more.

## Walkthrough

`s = "abbbc"` (rows), `p = "ab*c"` (columns). T marks true cells.

|  | "" | a | b | * | c |
| --- | --- | --- | --- | --- | --- |
| "" | T |  |  |  |  |
| a |  | T |  | T (zero b's) |  |
| b |  |  | T | T (absorb) |  |
| b |  |  |  | T (absorb) |  |
| b |  |  |  | T (absorb) |  |
| c |  |  |  |  | **T** |

Answer `true`: `b*` absorbs `bbb`.

## Complexity

- Plain recursion: exponential in the worst case.
- Memoised recursion or table: `O(m · n)` time and space.

## Edge cases

- Empty `s` with a pattern of starred pairs (`a*b*`): true, via row 0.
- `.*` matches any string, including empty.
- A pattern without stars: a simple position-by-position comparison with equal lengths.

## Common mistakes

- Treating `*` as a standalone wildcard (that is [Wildcard Matching](/problems/wildcard-matching)); here it modifies the previous character.
- Skipping row 0, which loses matches of an empty prefix of `s`.
- Using `match[i − 1][j − 1]` for the absorb case, which allows only one copy.

## In the interview

- Explain the `x*` unit and its two choices before writing anything.
- Likely follow-ups:
  - *Support `+` (one or more)?* Rewrite `x+` as `xx*`.
  - *Many strings against one pattern?* Compile the pattern to an automaton once.
