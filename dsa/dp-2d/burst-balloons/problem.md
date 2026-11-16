---
title: Burst Balloons
difficulty: Hard
order: 15
lists: [neetcode150, striver]
tags: [dp, interval-dp]
leetcode: burst-balloons
function: maxCoins
params:
  - { name: nums, type: "number[]" }
returns: number
hints:
  - Choosing which balloon to burst *first* splits nothing — its neighbours change. Think about which balloon is burst *last* in a range instead.
  - If balloon `k` is the last one burst between fixed walls `l` and `r`, it earns `val[l] · val[k] · val[r]`, and the two sides are independent subproblems.
  - Pad the array with a `1` on each end and fill `best[l][r]` by increasing gap `r - l`.
complexity: { time: "O(n³)", space: "O(n²)" }
---

There are `n` balloons in a row; balloon `i` shows the number `nums[i]`. You burst them one at a time, in any order, until none are left.

Bursting balloon `i` earns `left · nums[i] · right` coins, where `left` and `right` are the numbers on its **current** nearest unburst neighbours. If there is no neighbour on a side, treat that side as `1`. After a burst, the two neighbours become adjacent.

Return the maximum total coins you can earn.

## Constraints

- `1 <= nums.length <= 300`
- `0 <= nums[i] <= 100`
