---
title: Wildcard Matching
difficulty: Hard
order: 13
lists: [striver]
tags: [dp, string, two-sequences]
leetcode: wildcard-matching
function: isMatch
params:
  - { name: s, type: string }
  - { name: p, type: string }
returns: boolean
hints:
  - "`match[i][j]` = does `s[0..i)` match `p[0..j)`? Handle the last pattern character."
  - A `*` either matches nothing (drop it from the pattern) or absorbs one more character of `s` (drop that character, keep the `*`).
  - "An empty string matches a pattern prefix only if that prefix is all `*`."
complexity: { time: "O(m · n)", space: "O(n)" }
---

Implement wildcard matching. The pattern `p` may contain lowercase letters and two special characters:

- `?` matches exactly one character (any character),
- `*` matches any sequence of characters, including the empty sequence.

Return `true` if `p` matches the **whole** string `s`, not just part of it.

## Constraints

- `0 <= s.length, p.length <= 2000`
- `s` contains only lowercase English letters.
- `p` contains only lowercase English letters, `?` and `*`.
