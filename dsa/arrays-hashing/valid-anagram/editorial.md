**Key insight:** anagrams have identical letter counts. With a 26-letter alphabet, one count array — increment for `s`, decrement for `t` — must end all zeros.

## Approach

1. If the lengths differ, return `false` immediately.
2. Walk both strings together: `count[s[i]]++`, `count[t[i]]--`.
3. Return `true` only if every entry of `count` is `0`.

## Complexity

- Time `O(n)` — one pass plus a 26-entry scan.
- Space `O(1)` — the count array is fixed at 26 regardless of input size.

## Alternatives to mention

- Sort both strings and compare: `O(n log n)`, short to write.
- A `Map<char, number>` instead of an array — needed for the Unicode follow-up. In JS, iterate with `for...of` (code points), not by index, or surrogate pairs get split.

## Pitfalls

- Forgetting the length check: with a single shared counter array it's still correct, but early-exiting saves work and avoids index mistakes.
