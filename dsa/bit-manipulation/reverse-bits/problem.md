---
title: Reverse Bits
difficulty: Easy
order: 4
lists: [neetcode150]
tags: [bit-manipulation]
leetcode: reverse-bits
function: reverseBits
params:
  - { name: n, type: number }
returns: number
hints:
  - Peel bits off the low end of `n` and push them onto the low end of the result — 32 times.
  - "Append each bit with `result * 2 + bit` so the result stays unsigned. (In JS, `<<` and `|` produce signed 32-bit values; `result >>> 0` converts such a value back to unsigned.)"
complexity: { time: "O(1) (32 iterations)", space: "O(1)" }
---

Treat `n` as an unsigned 32-bit integer and reverse the order of its 32 bits: bit `0` swaps with bit `31`, bit `1` with bit `30`, and so on. Return the result, also as an **unsigned** 32-bit value (a number from `0` to `2^32 - 1`).

## Constraints

- `0 <= n <= 2^32 - 1`

**Follow-up:** if the function is called many times, how would you optimise it?
