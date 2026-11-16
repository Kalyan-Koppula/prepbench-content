---
title: Regular Expression Matching
difficulty: Hard
order: 14
lists: [neetcode150]
tags: [dp, string, two-sequences]
leetcode: regular-expression-matching
function: isMatch
params:
  - { name: s, type: string }
  - { name: p, type: string }
returns: boolean
hints:
  - Treat `x*` as a single pattern unit — it can never be split.
  - "For `x*` at the end of the pattern prefix: either use it zero times (drop both characters), or, if `x` matches the last character of `s`, let it absorb that character and stay."
  - "`match[i][j]` over prefixes; with an empty `s`, only patterns like `a*b*c*` can match."
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

Implement a small regular-expression matcher. The pattern `p` contains lowercase letters and two special characters:

- `.` matches any single character,
- `*` means "zero or more copies of the element right before it" (the element is a letter or `.`).

Return `true` if `p` matches the **entire** string `s`.

## Constraints

- `1 <= s.length <= 20`
- `1 <= p.length <= 20`
- `s` contains only lowercase English letters.
- `p` contains only lowercase English letters, `.` and `*`; every `*` directly follows a letter or `.`.
