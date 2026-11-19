**Key idea:** count from centres. Every palindromic substring has exactly one centre (a character, or the gap between two). From each of the `2n − 1` centres, expand outward; each successful step finds exactly one new palindrome. Total `O(n²)` time and `O(1)` space.

## Recognising the pattern

Counting substrings with a property that grows from the inside (`s[i..j]` is a palindrome when the ends match and `s[i+1..j−1]` is one) is the same interval structure as [Longest Palindromic Substring](/problems/longest-palindromic-substring), described in the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. Only the bookkeeping changes: count instead of keep the longest.

## Alternative: interval DP table (shown below)

Fill `isPal[i][j]` by increasing length: true when `s[i] = s[j]` and the inside is a palindrome (or empty). Count the true cells. That is the reference brute force below. Time and space `O(n²)`.

Checking each of the `n(n+1)/2` substrings directly by reversing it costs `O(n³)`.

## Counting from centres

1. `count = 0`.
2. For each `center`: add the expansions from `(center, center)` and from `(center, center + 1)`.
3. An expansion adds 1 for each step where `s[left] = s[right]`, then moves both ends outward; it stops at the first mismatch or the string's end.

**Why nothing is counted twice.** A palindrome's centre is fixed by its start and end: `(i + j) / 2`. So each palindromic substring is reached from exactly one centre, at exactly one step.

**Why stopping at the first mismatch is safe.** If `s[i..j]` is not a palindrome, no wider substring with the same centre can be one, because it contains `s[i..j]` as its middle.

## Walkthrough

`s = "abba"`

| centre | type | palindromes found | count |
| --- | --- | --- | --- |
| 0 | odd | a | 1 |
| 0–1 | even | (a, b) mismatch | 1 |
| 1 | odd | b | 2 |
| 1–2 | even | bb, abba | 4 |
| 2 | odd | b | 5 |
| 2–3 | even | (b, a) mismatch | 5 |
| 3 | odd | a | 6 |

Answer `6`.

## Complexity

- Reverse and compare every substring: `O(n³)`.
- Interval DP: `O(n²)` time and space.
- Centre expansion: `O(n²)` time, `O(1)` space. The worst case is a single repeated letter, where the answer itself is `n(n+1)/2`.

## Edge cases

- One character: 1.
- All letters different: `n` (only the single letters).
- All the same letter: `n(n+1)/2`.

## Common mistakes

- Only odd-length centres, missing `bb` and `abba`.
- Counting distinct strings instead of positions: `"aa"` has three palindromic substrings (`a`, `a`, `aa`), not two.
- Continuing an expansion past a mismatch.

## In the interview

- Explain the "one centre per palindrome" argument; it is what makes the count correct.
- Likely follow-ups:
  - *Count distinct palindromic substrings?* Collect them in a set (fine for small inputs), or use a palindromic tree.
  - *Minimum cuts to partition into palindromes?* Precompute `isPal`, then a 1-D DP over cut positions.
