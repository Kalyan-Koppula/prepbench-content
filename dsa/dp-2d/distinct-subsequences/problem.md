---
title: Distinct Subsequences
difficulty: Hard
order: 12
lists: [neetcode150, striver]
tags: [dp, string, two-sequences, counting]
leetcode: distinct-subsequences
function: numDistinct
params:
  - { name: s, type: string }
  - { name: t, type: string }
returns: number
hints:
  - Look at the last character of the prefix of `s`. Either it isn't used, or — if it equals the last character of the `t` prefix — it is matched to it.
  - "`ways[i][j]` = ways to form `t[0..j)` from `s[0..i)`. Forming the empty string always has exactly one way."
  - With one array over `j`, sweep `j` downward so you read the previous row's values.
complexity: { time: "O(m · n)", space: "O(n)" }
---

Given strings `s` and `t`, count the number of different ways to delete characters from `s` so that what remains is exactly `t`.

Two ways are different if they keep a different set of positions of `s`, even when the resulting strings look the same.

## Constraints

- `1 <= s.length, t.length <= 1000`
- `s` and `t` consist of English letters.
- The answer fits in a 32-bit signed integer.
