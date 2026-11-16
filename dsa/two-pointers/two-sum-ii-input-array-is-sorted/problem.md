---
title: Two Sum II – Input Array Is Sorted
difficulty: Medium
order: 2
lists: [neetcode150]
tags: [two-pointers]
leetcode: two-sum-ii-input-array-is-sorted
function: twoSum
params:
  - { name: numbers, type: "number[]" }
  - { name: target, type: number }
returns: "number[]"
hints:
  - The array is sorted. If the smallest plus the largest is too big, can the largest be part of any answer?
  - Start pointers at both ends; move the left one up when the sum is too small and the right one down when it's too large.
complexity: { time: "O(n)", space: "O(1)" }
---

You're given an array `numbers` sorted in non-decreasing order and an integer `target`. Exactly one pair of different positions has values summing to `target`.

Return the two positions as `[index1, index2]` using **1-based** indexing, with `index1 < index2`.

Use only constant extra space.

## Constraints

- `2 <= numbers.length <= 3 * 10^4`
- `-1000 <= numbers[i] <= 1000`
- `numbers` is sorted in non-decreasing order.
- `-1000 <= target <= 1000`
- Exactly one valid pair exists.
