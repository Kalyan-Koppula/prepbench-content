---
title: Valid Parenthesis String
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [greedy, range-tracking]
leetcode: valid-parenthesis-string
function: checkValidString
params:
  - { name: s, type: string }
returns: boolean
hints:
  - Without wildcards you'd track a single open-count. With them, the open-count could be any value in a range.
  - "Track `lo` and `hi`, the fewest and most unmatched `(` possible so far. A `*` widens the range both ways. Fail if `hi < 0`; clamp `lo` at 0; succeed if `lo === 0` at the end."
complexity: { time: "O(n)", space: "O(1)" }
---

The string `s` contains only `'('`, `')'` and `'*'`. Each `'*'` is a wildcard that you may treat as `'('`, as `')'`, or as nothing.

Return `true` if some choice for the wildcards makes `s` a balanced parentheses string — every `'('` is closed by a later `')'` and every `')'` closes an earlier `'('`.

## Constraints

- `1 <= s.length <= 100`
- `s[i]` is `'('`, `')'` or `'*'`.
