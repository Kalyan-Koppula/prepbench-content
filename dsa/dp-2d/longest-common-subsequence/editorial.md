**Key idea:** compare the prefixes of both strings. Let `lcs[i][j]` be the answer for the first `i` characters of `text1` and the first `j` of `text2`. If the last characters match, they can both end the common subsequence: `lcs[i − 1][j − 1] + 1`. If not, at least one of them is unused, so drop one or the other: `max(lcs[i − 1][j], lcs[i][j − 1])`.

## Recognising the pattern

Two sequences compared position by position is the "two prefixes" state in the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. LCS is its basic form; edit distance, interleaving, distinct subsequences and the matching problems all use the same table with different transitions.

## Alternative: memoised recursion over suffixes (shown below)

`best(i, j)` = LCS of `text1[i..]` and `text2[j..]`. If `a[i] = b[j]`, take `1 + best(i + 1, j + 1)`; otherwise `max(best(i + 1, j), best(i, j + 1))`. Without memoisation the branches overlap heavily and it is exponential; with a memo table, each `(i, j)` is computed once. That is the reference brute force below. `O(m · n)` time, plus `O(m + n)` recursion depth.

## Bottom-up table

1. A table of `(m + 1) × (n + 1)` zeros. Row 0 and column 0 stand for an empty prefix, whose LCS with anything is 0.
2. For `i` from 1 to `m`, `j` from 1 to `n`:
   - If `text1[i − 1] = text2[j − 1]`: `lcs[i][j] = lcs[i − 1][j − 1] + 1`.
   - Otherwise: `lcs[i][j] = max(lcs[i − 1][j], lcs[i][j − 1])`.
3. Return `lcs[m][n]`.

**Why taking the match is always safe.** If both last characters are equal, some longest common subsequence uses them as its last element: any LCS that doesn't can swap its last element for this pair without getting shorter.

## Walkthrough

`text1 = "blanket"` (rows), `text2 = "plant"` (columns). The padded row and column of zeros are omitted.

|  | p | l | a | n | t |
| --- | --- | --- | --- | --- | --- |
| b | 0 | 0 | 0 | 0 | 0 |
| l | 0 | **1** | 1 | 1 | 1 |
| a | 0 | 1 | **2** | 2 | 2 |
| n | 0 | 1 | 2 | **3** | 3 |
| k | 0 | 1 | 2 | 3 | 3 |
| e | 0 | 1 | 2 | 3 | 3 |
| t | 0 | 1 | 2 | 3 | **4** |

Bold cells are matches (diagonal + 1). Answer `4`, `"lant"`.

## Complexity

- Plain recursion: `O(2^(m + n))`.
- Memoised recursion or table: `O(m · n)` time, `O(m · n)` space.
- Two rows (previous and current): `O(min(m, n))` space if the shorter string is placed along the row.

## Edge cases

- An empty or fully disjoint pair: 0.
- Identical strings: their length.
- One string a subsequence of the other: the shorter length.

## Common mistakes

- Confusing subsequence with substring. A common **substring** needs contiguous matches, and its recurrence resets to 0 on a mismatch.
- Off-by-one: the table is indexed by prefix length, so the characters are `text1[i − 1]` and `text2[j − 1]`.
- On a match, taking `max` of all three neighbours instead of the diagonal + 1 (not wrong, but obscures the reasoning).

## In the interview

- Define the state in one sentence, then the two cases.
- Likely follow-ups:
  - *Return the subsequence?* Walk back from `(m, n)`: diagonal on a match, otherwise toward the larger neighbour.
  - *Shortest common supersequence?* `m + n − LCS`.
  - *Minimum deletions to make the strings equal?* `m + n − 2 · LCS`.
