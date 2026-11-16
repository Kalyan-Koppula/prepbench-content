---
title: Evaluate Reverse Polish Notation
difficulty: Medium
order: 3
lists: [neetcode150]
tags: [stack, expression]
leetcode: evaluate-reverse-polish-notation
function: evalRPN
params:
  - { name: tokens, type: "string[]" }
returns: number
hints:
  - In postfix notation an operator always applies to the two most recent values that haven't been consumed yet.
  - Push numbers; on an operator, pop two, combine them, push the result. Watch the operand order for `-` and `/`.
complexity: { time: "O(n)", space: "O(n)" }
---

`tokens` is an arithmetic expression written in **postfix** (reverse Polish) notation: each operator comes after its two operands, so `["2", "5", "-"]` means `2 - 5`.

Each token is either an integer or one of the operators `+`, `-`, `*`, `/`. Division between integers **truncates toward zero** (`7 / -2` is `-3`).

Evaluate the expression and return its value.

## Constraints

- `1 <= tokens.length <= 10^4`
- Every integer token is in the range `[-200, 200]`.
- The expression is valid, never divides by zero, and every intermediate result fits in a 32-bit signed integer.
