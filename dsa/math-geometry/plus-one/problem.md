---
title: Plus One
difficulty: Easy
order: 1
lists: [neetcode150]
tags: [math, digits]
leetcode: plus-one
function: plusOne
params:
  - { name: digits, type: "number[]" }
returns: "number[]"
hints:
  - Add from the least significant digit and stop as soon as there's no carry.
  - "A `9` becomes `0` and carries; if every digit was `9`, you need one extra leading `1`."
complexity: { time: "O(n)", space: "O(1) extra" }
---

A non-negative integer is stored as the array `digits`, most significant digit first, one decimal digit per element. The number has no leading zeros unless it is `0` itself.

Return the digit array of that number plus one, in the same format.

## Constraints

- `1 <= digits.length <= 100`
- `0 <= digits[i] <= 9`
- `digits` has no leading zero, except the array `[0]`.
