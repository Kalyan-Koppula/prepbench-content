---
title: Multiply Strings
difficulty: Medium
order: 6
lists: [neetcode150]
tags: [math, strings, simulation]
leetcode: multiply-strings
function: multiply
params:
  - { name: num1, type: string }
  - { name: num2, type: string }
returns: string
hints:
  - The product of an `m`-digit and an `n`-digit number has at most `m + n` digits.
  - "Digit `i` of `num1` times digit `j` of `num2` lands in positions `i + j` and `i + j + 1` of an `m + n` result array. Accumulate, carry, then strip leading zeros."
complexity: { time: "O(m · n)", space: "O(m + n)" }
---

Two non-negative integers are given as decimal strings `num1` and `num2`. Return their product, also as a decimal string with no leading zeros.

Don't convert the whole inputs to numbers (`Number`, `parseInt`, `BigInt`) — do the arithmetic digit by digit.

## Constraints

- `1 <= num1.length, num2.length <= 200`
- Both strings contain only digits and have no leading zeros, except for the number `"0"` itself.
