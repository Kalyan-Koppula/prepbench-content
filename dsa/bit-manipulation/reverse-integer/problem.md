---
title: Reverse Integer
difficulty: Medium
order: 8
lists: [neetcode150]
tags: [math, digits, overflow]
leetcode: reverse-integer
function: reverse
params:
  - { name: x, type: number }
returns: number
hints:
  - "Pop the last digit with `% 10`, push it with `rev * 10 + digit`. In JS, use `Math.trunc` so negatives round toward zero."
  - "Before each push, check whether `rev * 10 + digit` would leave `[-2^31, 2^31 - 1]` — compare `rev` against `MAX / 10` (truncated) and the digit against the last digit of the limit."
complexity: { time: "O(log |x|)", space: "O(1)" }
---

Given a signed 32-bit integer `x`, return the integer formed by reversing its decimal digits, keeping the sign. Leading zeros in the reversed number disappear (`120` becomes `21`).

If the reversed value falls outside the signed 32-bit range `[-2^31, 2^31 - 1]`, return `0`.

Pretend your environment can't hold anything wider than 32 bits: detect the overflow **before** it happens rather than computing the full reversed value and range-checking it afterwards.

## Constraints

- `-2^31 <= x <= 2^31 - 1`
