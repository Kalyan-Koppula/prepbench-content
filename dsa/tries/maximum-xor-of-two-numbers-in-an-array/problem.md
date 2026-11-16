---
title: Maximum XOR of Two Numbers in an Array
difficulty: Medium
order: 4
lists: [striver]
tags: [trie, bit-manipulation]
leetcode: maximum-xor-of-two-numbers-in-an-array
function: findMaximumXOR
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - XOR is maximised by winning the highest bit first — a 1 in bit 30 beats anything in bits 0–29.
  - Store every number's bits, most significant first, in a binary trie. For a given `x`, walk down preferring the child whose bit is the opposite of `x`'s.
complexity: { time: "O(n · B)", space: "O(n · B)" }
---

Given an array of non-negative integers `nums`, return the largest value of `nums[i] XOR nums[j]` over all index pairs with `0 <= i <= j < nums.length`.

Choosing `i = j` is allowed (it gives `0`), so an array with one element has answer `0`.

## Constraints

- `1 <= nums.length <= 2 * 10^5`
- `0 <= nums[i] <= 2^31 - 1`

**Follow-up:** can you beat the `O(n²)` pairwise check?
