**Key idea:** every palindrome has a centre: one character for odd lengths, or the gap between two characters for even lengths. There are `2n − 1` centres. From each, expand outward while the two ends match. The longest expansion over all centres is the answer, in `O(n²)` time and `O(1)` space.

## Recognising the pattern

"Longest substring with a property", where the property for `s[i..j]` follows from the property for `s[i+1..j−1]`, is an interval DP (see [1-D Dynamic Programming](/problems/patterns/dp-1d) and [2-D Dynamic Programming](/problems/patterns/dp-2d)). Expanding around centres visits the same states in a different order and needs no table.

## Alternative: interval DP table (shown below)

`isPal[i][j]` is true when `s[i] = s[j]` and the inside `s[i+1..j−1]` is a palindrome (or there is no inside, for lengths 1 and 2). Fill by increasing length, so the inside is always ready. Track the longest true cell. That is the reference brute force below. Time `O(n²)`, space `O(n²)`.

The truly naive approach, checking every substring directly, is `O(n³)`.

## Expanding around centres

1. For each `center` from 0 to `n − 1`:
   1. Expand from `(center, center)` for odd lengths.
   2. Expand from `(center, center + 1)` for even lengths.
2. An expansion moves `left` down and `right` up while both are in range and `s[left] = s[right]`. When it stops, the palindrome is `s[left+1..right−1]`, of length `right − left − 1`.
3. Keep the longest; on ties keep the earlier one (use `>` not `>=`).

**Why it is a DP in disguise.** Expanding from a centre checks `s[i+1..j−1]` before `s[i..j]`, exactly the dependency in the table. Because each step depends only on the previous step at the same centre, a single pair of indices replaces the whole table.

## Walkthrough

`s = "racecars"`

| centre | type | expansion | length |
| --- | --- | --- | --- |
| 0 (r) | odd | r | 1 |
| 2 (c) | odd | c → (a, e) mismatch | 1 |
| 3 (e) | odd | e → cec → aceca → racecar → stops at the end | 7 |
| 3–4 | even | e, c mismatch | 0 |
| 5 (a) | odd | a → (c, r) mismatch | 1 |

Answer `"racecar"`, starting at index `3 − 3 = 0`.

## Complexity

- All substrings checked directly: `O(n³)` time.
- Interval DP: `O(n²)` time and space.
- Centre expansion: `O(n²)` time worst case (a string of one repeated letter), `O(1)` extra space.
- Manacher's algorithm achieves `O(n)`, rarely expected.

## Edge cases

- Length 1: the string itself.
- No repeated neighbours or mirrors (`"abcd"`): the first character.
- All the same letter: the whole string, found from the middle centre.
- Even-length answers (`"abba"`): only found from the gap centres.

## Common mistakes

- Forgetting even-length centres.
- Off-by-one when converting the expansion's end indices back to a start and length.
- Filling the interval table by `i` ascending, so the inside cell isn't ready yet.

## In the interview

- Mention the `O(n³)` check, then the table, then the centre expansion as the space-saving version.
- Likely follow-ups:
  - *Count palindromic substrings?* The same expansion, counting each step.
  - *Longest palindromic subsequence (not contiguous)?* A different 2-D DP: `lps[i][j]` with skip-one-end transitions.
  - *Linear time?* Manacher's algorithm reuses mirror information inside the current rightmost palindrome.
