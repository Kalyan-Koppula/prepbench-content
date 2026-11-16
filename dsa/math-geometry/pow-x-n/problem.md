---
title: Pow(x, n)
difficulty: Medium
order: 5
lists: [neetcode150, striver]
tags: [math, fast-exponentiation, divide-and-conquer]
leetcode: pow-x-n
function: myPow
params:
  - { name: x, type: number }
  - { name: n, type: number }
returns: number
compare: float
hints:
  - "`x^n = (x^(n/2))^2` when `n` is even — that halves the work."
  - "Process the exponent's binary digits: square the base each step and multiply it into the result when the current bit is 1. Handle negative `n` with `1 / x^|n|`."
complexity: { time: "O(log |n|)", space: "O(1)" }
---

Compute `x` raised to the integer power `n`, without calling `Math.pow` or the `**` operator.

Answers within `1e-5` relative error (or absolute error, for results below `1` in magnitude) are accepted.

## Constraints

- `-100 < x < 100`
- `-2^31 <= n <= 2^31 - 1`, `n` is an integer
- `x !== 0` or `n > 0`
- `-10^4 <= x^n <= 10^4`
