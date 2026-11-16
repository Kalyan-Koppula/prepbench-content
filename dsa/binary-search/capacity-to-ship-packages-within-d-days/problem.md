---
title: Capacity To Ship Packages Within D Days
difficulty: Medium
order: 9
lists: [striver]
tags: [binary-search, binary-search-on-answer]
leetcode: capacity-to-ship-packages-within-d-days
function: shipWithinDays
params:
  - { name: weights, type: "number[]" }
  - { name: days, type: number }
returns: number
hints:
  - For a fixed capacity, loading greedily (keep adding until the next package doesn't fit) gives the fewest days.
  - The capacity is at least the heaviest package and at most the total weight. Is "can ship in time" monotonic in capacity?
complexity: { time: "O(n log(sum))", space: "O(1)" }
---

Packages sit on a conveyor belt in a fixed order; package `i` weighs `weights[i]`. Each day a ship takes packages from the front of the belt, in order, as long as their total weight stays within the ship's capacity. Packages can't be split or reordered.

Return the **smallest** ship capacity that gets every package shipped within `days` days.

## Constraints

- `1 <= days <= weights.length <= 5 * 10^4`
- `1 <= weights[i] <= 500`
