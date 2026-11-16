**Key insight:** a palindrome is determined by its centre and radius, and there are only `2n - 1` centres — expanding from each finds every maximal palindrome in `O(n²)` total with `O(1)` memory.

## Approach 1 — interval DP (the DP framing)

- **State:** `pal[i][j]` = `s[i..j]` is a palindrome.
- **Recurrence:** `pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1])`.
- **Base cases:** single characters (`i === j`) are palindromes; two equal adjacent characters are too — both covered by `j - i < 2`.
- **Order:** `pal[i][j]` reads the strictly shorter interval `[i+1, j-1]`, so iterate by increasing length (or `i` from `n - 1` down to `0`, `j` upward).
- Track the longest `true` interval, preferring the smallest `i` on ties.

This is `O(n²)` time **and** space.

## Approach 2 — expand around centres (the space optimisation)

1. For each index `i`, expand the odd centre `(i, i)` and the even centre `(i, i + 1)` while the two ends match.
2. The palindrome found has length `hi - lo - 1` after the loop stops.
3. Replace the best only when **strictly** longer. Centres are visited left to right, and for a fixed length a later centre means a later start, so ties keep the leftmost palindrome.

The DP table is only ever consulted along a diagonal from each centre, which is exactly what the expansion walks — so the table can be dropped entirely.

## Complexity

- Time `O(n²)` — each of the `2n - 1` expansions is `O(n)` worst case (e.g. `"aaaa…"`).
- Space `O(1)` beyond the output.

## Alternatives to mention

- Brute force: check every substring, `O(n³)`.
- **Manacher's algorithm** finds all palindromic radii in `O(n)` — name it, but it's rarely expected in full.

## Pitfalls

- Forgetting even-length centres (`"abba"`).
- Updating on `>=` returns the rightmost of equal-length answers.
- Comparisons are case-sensitive: `"Aa"` is not a palindrome.
