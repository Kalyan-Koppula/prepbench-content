**Key idea:** the naive search restarts from scratch after every mismatch. KMP (Knuth-Morris-Pratt) avoids that. It precomputes, for every prefix of the needle, the longest proper prefix that is also a suffix (the `lps` array). After a mismatch, the part of the needle already matched tells you how much of a match you still have, so the haystack pointer never moves backwards. `O(n + m)` total.

## Recognising the pattern

Finding a pattern in a text is the classic string-matching problem from the [Strings](/problems/patterns/strings) sheet. The brute force is fine for small inputs; KMP (or rolling hashes) is the answer to "can you do it in linear time?".

## Brute force

Try every start `i` and compare characters until a mismatch. That is the reference brute force below. `O(n · m)` in the worst case, for inputs like `haystack = "aaaa…a"`, `needle = "aa…ab"`.

## KMP

**Build `lps`.** `lps[i]` is the length of the longest proper prefix of `needle[0..i]` that is also its suffix.

1. `length = 0`, `lps[0] = 0`.
2. For `i` from 1: while `length > 0` and `needle[i] ≠ needle[length]`, fall back: `length = lps[length − 1]`. If they match, `length++`. Set `lps[i] = length`.

**Search.**

1. `j = 0` (needle characters matched).
2. For each `i` in the haystack: while `j > 0` and `haystack[i] ≠ needle[j]`, `j = lps[j − 1]`. If they match, `j++`. If `j = m`, return `i − m + 1`.
3. Return −1.

**Why falling back to `lps[j − 1]` is safe.** The last `j` characters of the haystack equal `needle[0..j)`. The longest prefix of the needle that could still be in progress is the longest border of that matched part, which is exactly `lps[j − 1]`. Any longer restart would have been a longer border.

## Walkthrough

`needle = "abcabd"`: `lps = [0, 0, 0, 1, 2, 0]` (the borders are `a` at index 3 and `ab` at index 4).

`haystack = "abcabcabd"`:

| i | haystack[i] | j before | action | j after |
| --- | --- | --- | --- | --- |
| 0–4 | a b c a b | 0–4 | match | 5 |
| 5 | c | 5 | `c ≠ d`: j = lps[4] = 2; then `c = needle[2]` | 3 |
| 6 | a | 3 | match | 4 |
| 7 | b | 4 | match | 5 |
| 8 | d | 5 | match | 6 = m |

Answer `8 − 6 + 1 = 3`. The haystack pointer never moved back; the fallback kept the `ab` already matched.

## Complexity

- Brute force: `O(n · m)` worst case, `O(1)` space.
- KMP: `O(n + m)` time (the `while` loops move `j` back at most as often as it moved forward), `O(m)` space.
- Rabin-Karp with a rolling hash: `O(n + m)` expected.

## Edge cases

- Needle longer than the haystack: −1.
- Needle equal to the haystack: 0.
- Repeated characters (`"aaab"` in `"aaaaab"`): the case where KMP's fallback matters most.

## Common mistakes

- Starting the `lps` loop at 0, which makes every prefix its own border.
- Moving the haystack pointer back after a mismatch (that's the naive algorithm).
- Off-by-one in the return value (`i − m + 1`, not `i − m`).

## In the interview

- Offer the brute force first; it is often acceptable. Then explain `lps` with a small example.
- Likely follow-ups:
  - *All occurrences?* After a full match, set `j = lps[m − 1]` and continue.
  - *Shortest Palindrome?* `lps` of `s + '#' + reverse(s)` ([Shortest Palindrome](/problems/shortest-palindrome)).
  - *Repeated Substring Pattern?* `s` is a repetition when `n % (n − lps[n − 1]) = 0` and `lps[n − 1] > 0`.
