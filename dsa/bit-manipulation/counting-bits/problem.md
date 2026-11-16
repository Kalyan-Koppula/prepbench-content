---
title: Counting Bits
difficulty: Easy
order: 3
lists: [neetcode150]
tags: [bit-manipulation, dp]
leetcode: counting-bits
function: countBits
params:
  - { name: n, type: number }
returns: "number[]"
hints:
  - "How does the bit count of `i` relate to that of `i >> 1`?"
  - "`bits[i] = bits[i >> 1] + (i & 1)` — shifting right drops only the lowest bit. (Or use `bits[i & (i - 1)] + 1`.)"
complexity: { time: "O(n)", space: "O(1) extra" }
---

Given a non-negative integer `n`, return an array `ans` of length `n + 1` where `ans[i]` is the number of `1` bits in the binary form of `i`, for every `i` from `0` to `n`.

## Constraints

- `0 <= n <= 10^5`

**Follow-up:** do it in a single `O(n)` pass without counting each number's bits from scratch.
