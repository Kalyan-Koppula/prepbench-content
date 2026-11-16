---
title: Valid Parentheses
difficulty: Easy
order: 1
lists: [neetcode150, striver]
tags: [stack]
leetcode: valid-parentheses
function: isValid
params:
  - { name: s, type: string }
returns: boolean
hints:
  - The most recently opened bracket must be the first one closed.
  - Push openers; on a closer, the top of the stack must be its partner. What should be left at the end?
complexity: { time: "O(n)", space: "O(n)" }
---

The string `s` consists only of the bracket characters `(`, `)`, `[`, `]`, `{` and `}`.

Return `true` if the brackets are balanced: every opener is closed by a closer of the **same type**, and pairs close in the correct nesting order (an inner pair must close before the pair around it). Otherwise return `false`.

## Constraints

- `1 <= s.length <= 10^4`
- `s` contains only `()[]{}`.
