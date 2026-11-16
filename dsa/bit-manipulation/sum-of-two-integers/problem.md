---
title: Sum of Two Integers
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [bit-manipulation, math]
leetcode: sum-of-two-integers
function: getSum
params:
  - { name: a, type: number }
  - { name: b, type: number }
returns: number
hints:
  - Adding two bits gives a sum bit (XOR) and a carry bit (AND, shifted left).
  - "Repeat `[a, b] = [a ^ b, (a & b) << 1]` until the carry `b` is `0`."
complexity: { time: "O(1) (at most 32 iterations)", space: "O(1)" }
---

Return the sum of the integers `a` and `b` **without** using the `+` or `-` operators (including `+=`, `++`, `-=` and friends).

## Constraints

- `-1000 <= a, b <= 1000`
