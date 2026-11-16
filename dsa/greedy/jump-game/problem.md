---
title: Jump Game
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [greedy, reachability]
leetcode: jump-game
function: canJump
params:
  - { name: nums, type: "number[]" }
returns: boolean
hints:
  - You don't need to know which jumps to take — only the farthest index reachable so far.
  - "Scan left to right keeping `reach`. If you ever stand on an index beyond `reach`, you're stuck."
complexity: { time: "O(n)", space: "O(1)" }
---

You start on index `0` of the array `nums`. From index `i` you may move forward by any number of steps from `0` up to `nums[i]`.

Return `true` if you can land on the last index, otherwise `false`.

## Constraints

- `1 <= nums.length <= 10^4`
- `0 <= nums[i] <= 10^5`
