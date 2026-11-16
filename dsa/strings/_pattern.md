---
title: Strings
order: 20
summary: Careful scanning, parsing and matching — plus prefix-function tricks that turn O(n·m) searches into O(n + m).
---

## Recognise it

- Parse or normalise text: whitespace, signs, numerals, overflow limits.
- Compare strings position by position (common prefixes, palindromes).
- "Find a pattern inside a text" or "longest prefix that is also a suffix/palindrome".
- Reversing or reordering words without allocating much.

## Templates

KMP prefix function (`lps[i]` = length of the longest proper prefix of `p[0..i]` that is also a suffix of it):

```ts
const lps = new Array(p.length).fill(0)
for (let i = 1, len = 0; i < p.length; i++) {
  while (len > 0 && p[i] !== p[len]) len = lps[len - 1]
  if (p[i] === p[len]) len++
  lps[i] = len
}
```

Character scanning with an index (parsers):

```ts
let i = 0
while (i < s.length && s[i] === ' ') i++
while (i < s.length && s[i] >= '0' && s[i] <= '9') {
  value = value * 10 + (s.charCodeAt(i) - 48)
  i++
}
```

## Interview notes

- JS strings are immutable: building with `+=` in a loop is fine in modern engines, but for heavy edits collect parts in an array and `join` once. Say this out loud.
- `s.split(' ')` keeps empty strings for repeated spaces; `s.trim().split(/\s+/)` doesn't.
- Pattern search: naive `O(n·m)`; KMP and Z-function are `O(n + m)` worst case; Rabin–Karp is `O(n + m)` expected with rolling hashes (verify on hash match).
- "Prefix that is also a suffix" questions reduce to the prefix function of a combined string like `p + '#' + t`.
- Index arithmetic with `charCodeAt(i) - 48` (digits) or `- 97` (lowercase letters) avoids allocations.

## Pitfalls

- Off-by-one on substring bounds: `slice(start, end)` excludes `end`.
- Overflow checks must happen **before** multiplying by 10 in fixed-width languages; in JS you can compare after, but clamp correctly.
- Separators in combined strings (`'#'`) must not appear in the input, or matches leak across the boundary.
- Unicode: `s.length` counts UTF-16 code units, not characters — fine for ASCII-only constraints.
