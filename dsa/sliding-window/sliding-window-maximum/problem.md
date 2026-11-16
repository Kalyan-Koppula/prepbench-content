---
title: Sliding Window Maximum
difficulty: Hard
order: 9
lists: [neetcode150, striver]
tags: [sliding-window, monotonic-deque]
leetcode: sliding-window-maximum
function: maxSlidingWindow
params:
  - { name: nums, type: "number[]" }
  - { name: k, type: number }
returns: "number[]"
hints:
  - If a newer element is at least as large as an older one, the older one can never be a window maximum again.
  - Keep indices in a deque whose values decrease from front to back. The front is the current maximum.
  - Pop the front once its index slides out of the window.
complexity: { time: "O(n)", space: "O(k)" }
---

You're given an integer array `nums` and a window size `k`. A window of `k` consecutive elements starts at index `0` and moves right one position at a time until it reaches the end of the array.

Return an array containing the maximum of each window position, in order.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `1 <= k <= nums.length`
