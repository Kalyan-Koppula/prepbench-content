---
title: Kth Largest Element in a Stream
difficulty: Easy
order: 1
lists: [neetcode150]
tags: [heap, design]
leetcode: kth-largest-element-in-a-stream
kind: class
class: KthLargest
params:
  - { name: k, type: number }
  - { name: nums, type: "number[]" }
methods:
  - name: add
    params: [{ name: val, type: number }]
    returns: number
hints:
  - You never need the elements below the top `k` again.
  - Keep a min-heap of at most `k` elements. Its top is exactly the k-th largest.
complexity: { time: "O(log k) per add", space: "O(k)" }
---

Design a class that tracks the **k-th largest** value seen so far in a stream of integers (counting duplicates separately — in `[5, 5, 3]` the 2nd largest is `5`).

- `KthLargest(k, nums)` starts with the integers in `nums`.
- `add(val)` appends `val` to the stream and returns the current k-th largest value.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= k <= 10^4`
- `0 <= nums.length <= 10^4`
- `-10^4 <= nums[i], val <= 10^4`
- At most `10^4` calls to `add`.
- Whenever `add` returns, the stream holds at least `k` values.
