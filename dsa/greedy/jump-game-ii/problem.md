---
title: Jump Game II
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [greedy, bfs-levels]
leetcode: jump-game-ii
function: jump
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - Think of the indices reachable with exactly `k` jumps as a contiguous window.
  - "Scan the current window, tracking the farthest index any of its cells can reach; that becomes the next window and costs one more jump."
complexity: { time: "O(n)", space: "O(1)" }
---

You start on index `0` of `nums`. From index `i` you may jump forward to any index `i + s` where `1 <= s <= nums[i]`.

Return the minimum number of jumps needed to land on the last index. The input is guaranteed to make the last index reachable.

## Constraints

- `1 <= nums.length <= 10^4`
- `0 <= nums[i] <= 1000`
- The last index is reachable from index `0`.
