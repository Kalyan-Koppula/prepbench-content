---
title: Number of 1 Bits
difficulty: Easy
order: 2
lists: [neetcode150]
tags: [bit-manipulation, popcount]
leetcode: number-of-1-bits
function: hammingWeight
params:
  - { name: n, type: number }
returns: number
hints:
  - Checking each of the 31 bits with a shift and a mask works fine.
  - "`n & (n - 1)` removes the lowest set bit — loop until `n` is zero and count iterations."
complexity: { time: "O(k), k = number of set bits", space: "O(1)" }
---

Given a positive integer `n`, return the number of `1` bits in its binary representation (its *population count*, or Hamming weight).

## Constraints

- `1 <= n <= 2^31 - 1`

**Follow-up:** if this were called millions of times, how would you speed it up?
