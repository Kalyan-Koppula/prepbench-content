**Key idea:** build a partition left to right by choosing where the next piece ends. Only continue when that piece is a palindrome. When the cuts reach the end of the string, record the pieces. A table precomputed with DP answers "is `s[i..j]` a palindrome?" in `O(1)`.

## Recognising the pattern

"Return every way to split a string so that each piece satisfies a rule" is the "choose where to cut" form of the [Backtracking](/problems/patterns/backtracking) sheet. The palindrome test is the pruning, and caching it is a small dynamic programming step.

## Brute force

Each of the `n − 1` gaps between letters is either a cut or not, giving `2^(n−1)` partitions. Generate them all and keep those where every piece is a palindrome. That is the reference brute force below. It examines every partition even when the first piece already fails.

## Backtracking with a palindrome table

1. **Table.** `isPal[i][j]` is true when `s[i] == s[j]` and the inside `s[i+1..j−1]` is a palindrome (or has length 0 or 1). Fill `i` from the end so the inner span is ready. `O(n²)`.
2. `explore(start)`:
   1. If `start == n`, record a copy of the pieces.
   2. For each `end` from `start` to `n − 1`: if `isPal[start][end]`, push `s[start..end]`, call `explore(end + 1)`, pop.

Failed pieces are rejected immediately, so whole subtrees of the brute force are never generated.

## Walkthrough

`s = "aab"`

| start | candidate pieces | palindrome? | continue with |
| --- | --- | --- | --- |
| 0 | "a" | yes | start 1 |
| 1 | "a" | yes | start 2 |
| 2 | "b" | yes | record ["a", "a", "b"] |
| 1 | "ab" | no | – |
| 0 | "aa" | yes | start 2 |
| 2 | "b" | yes | record ["aa", "b"] |
| 0 | "aab" | no | – |

Answer `[["a","a","b"], ["aa","b"]]`.

## Complexity

- Brute force: time `O(n · 2^n)`, checking every piece of every partition.
- Backtracking: up to `2^(n−1)` partitions are valid in the worst case (`"aaaa…"`), each built in `O(n)`, so time is `O(n · 2^n)`, but invalid branches are cut early. The table costs `O(n²)` time and space; the recursion is `O(n)` deep.

## Edge cases

- One character: `[[s]]`.
- All characters equal: every partition is valid, the worst case.
- No repeated characters: only the split into single letters.

## Common mistakes

- Checking palindromes with string reversal at every step, which multiplies the cost.
- Filling the table in the wrong order, so `isPal[i + 1][j − 1]` isn't ready.
- Recording the path without copying it.

## In the interview

- Mention the table as a small DP that makes each check constant.
- Likely follow-ups:
  - *Minimum number of cuts (Palindrome Partitioning II)?* DP over prefixes: `cuts[j] = min(cuts[i − 1] + 1)` over palindromic `s[i..j]`.
  - *Count the partitions?* DP that sums instead of enumerating.
