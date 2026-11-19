**Key idea:** let `ways[i][j]` be the number of ways to form the first `j` characters of `t` from the first `i` characters of `s`. The character `s[i − 1]` is either not used (`ways[i − 1][j]`) or, if it equals `t[j − 1]`, used as that character (`ways[i − 1][j − 1]`). Add the two.

## Recognising the pattern

Counting the ways one sequence appears inside another is the two-prefix table from the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet: the counting cousin of [Longest Common Subsequence](/problems/longest-common-subsequence), with "skip or use" in place of "skip either or match".

## Alternative: memoised recursion over suffixes (shown below)

`count(i, j)` = ways to form `t[j..]` from `s[i..]`. If `t` is used up, there is exactly one way (delete the rest). If `s` has fewer characters left than `t` needs, zero. Otherwise skip `s[i]`, plus match it with `t[j]` when they are equal. With memoisation, `O(m · n)`. That is the reference brute force below. Listing all subsequences of `s` instead would be `O(2^m)`.

## Bottom-up table

1. `ways[i][0] = 1` for every `i`: the empty target is formed one way.
2. `ways[0][j] = 0` for `j > 0`: an empty source can't form a non-empty target.
3. For `i` from 1 to `m`, `j` from 1 to `n`:
   - `ways[i][j] = ways[i − 1][j]`.
   - If `s[i − 1] = t[j − 1]`, add `ways[i − 1][j − 1]`.
4. Return `ways[m][n]`.

**One row, iterated downward.** Row `i` reads only row `i − 1`, at `j` and `j − 1`. With a single array, go `j` from `n` down to 1 so `ways[j − 1]` still holds the previous row's value.

## Walkthrough

`s = "banana"` (rows), `t = "ban"` (columns)

|  | "" | b | a | n |
| --- | --- | --- | --- | --- |
| "" | 1 | 0 | 0 | 0 |
| b | 1 | 1 | 0 | 0 |
| a | 1 | 1 | 1 | 0 |
| n | 1 | 1 | 1 | 1 |
| a | 1 | 1 | 2 | 1 |
| n | 1 | 1 | 2 | 3 |
| a | 1 | 1 | 3 | 3 |

At the second `n`: `ways = 1 (without it) + 2 (ba-prefixes before it) = 3`. Answer `3`.

## Complexity

- All subsequences: `O(2^m)`.
- Memoised recursion or table: `O(m · n)` time; `O(m · n)` space, or `O(n)` with one row.

## Edge cases

- `t` longer than `s`: 0.
- `t` empty: 1.
- Repeated letters (`"aaa"`, `"aa"`): 3, the number of ways to choose 2 positions of 3.
- Large counts: intermediate values can exceed 32 bits in some languages even when the answer fits; use 64-bit integers.

## Common mistakes

- `ways[i][0] = 0`, which makes everything 0.
- On a match, using only the diagonal and forgetting the "skip" option.
- Iterating the one-row version upward, which lets one character of `s` match two characters of `t`.

## In the interview

- State the two choices for `s[i − 1]` clearly; the recurrence is then one line.
- Likely follow-ups:
  - *Is `t` a subsequence at all?* A two-pointer scan, `O(m)`.
  - *Many targets against one long `s`?* Precompute, for each position, the next occurrence of each letter.
