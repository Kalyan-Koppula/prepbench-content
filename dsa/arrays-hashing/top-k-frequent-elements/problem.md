---
title: Top K Frequent Elements
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [hash-map, bucket-sort, heap]
leetcode: top-k-frequent-elements
function: topKFrequent
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: "number[]"
compare: unordered
hints:
  - Start by counting how often each value occurs.
  - A frequency can never exceed `nums.length`. Could you index buckets by frequency instead of sorting?
complexity: { time: "O(n)", space: "O(n)" }
---

Given an integer array `nums` and an integer `k`, return the `k` distinct values that occur most often in `nums`. The values may be returned in any order.

The input guarantees the answer is unique: the `k`-th highest frequency is strictly greater than the next one.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `1 <= k <=` number of distinct values in `nums`
- The set of `k` most frequent values is unique.

**Follow-up:** can you beat `O(n log n)`?
