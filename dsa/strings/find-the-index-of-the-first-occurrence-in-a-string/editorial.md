**Key insight (KMP):** after matching `len` characters and then failing, the pattern's own structure tells you how much of that match can be reused — the longest proper prefix of `needle[0..len)` that is also its suffix. The text pointer never moves backwards.

## Approach

1. Build `lps` for `needle`: `lps[i]` = length of the longest proper prefix of `needle[0..i]` that is also a suffix of it. Build it with the same fall-back loop you use for matching.
2. Scan `haystack` with `j` = number of needle characters currently matched:
   - While `j > 0` and `haystack[i] !== needle[j]`, set `j = lps[j - 1]`.
   - If they match, `j++`.
   - If `j === m`, the match ends at `i`: return `i - m + 1`.
3. Return `-1`.

## Complexity

- Time `O(n + m)` — `j` increases at most once per text character and each fall-back strictly decreases it, so total fall-backs are bounded by total increases.
- Space `O(m)` — the `lps` array.

## Alternatives to mention

- **Naive**: try every start, compare up to `m` chars — `O(n · m)` worst case (e.g. many near-matches of `aaa…ab`). Usually fine in practice and what built-ins do for short patterns; say so.
- **Z-function** on `needle + '#' + haystack`: the first position after the separator with `z[i] >= m` is a match. Also `O(n + m)`; some find it easier to derive.
- **Rabin–Karp**: rolling hash of each length-`m` window; compare characters only on a hash hit. `O(n + m)` expected, `O(n · m)` worst case with many collisions. Shines for multi-pattern search or 2D matching.

## Pitfalls

- Building `lps` with the wrong starting index: `lps[0]` is always `0`, start the loop at `i = 1`.
- When `needle` is longer than `haystack`, return `-1` (the loop handles it naturally).
