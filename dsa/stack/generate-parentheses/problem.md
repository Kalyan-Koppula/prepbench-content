---
title: Generate Parentheses
difficulty: Medium
order: 4
lists: [neetcode150]
tags: [backtracking, stack]
leetcode: generate-parentheses
function: generateParenthesis
params:
  - { name: n, type: number }
returns: "string[]"
compare: unordered
hints:
  - Build the string one character at a time. When is it legal to add `(`? When is it legal to add `)`?
  - Track how many opens and closes you've used; a `)` is allowed only while closes < opens.
complexity: { time: "O(4^n / sqrt(n))", space: "O(n) recursion depth" }
---

Given `n`, return every string made of `n` pairs of parentheses that is **well-formed** — each `(` is matched by a later `)`, and no prefix has more `)` than `(`.

Return the strings in any order.

## Constraints

- `1 <= n <= 8`
