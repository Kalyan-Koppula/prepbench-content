---
title: Car Fleet
difficulty: Medium
order: 9
lists: [neetcode150]
tags: [stack, sorting]
leetcode: car-fleet
function: carFleet
params:
  - { name: target, type: number }
  - { name: position, type: "number[]" }
  - { name: speed, type: "number[]" }
returns: number
hints:
  - Work out when each car would reach the target if the road were empty.
  - Process cars from closest-to-target to farthest. A car that would arrive no later than the fleet in front of it gets stuck behind that fleet.
  - Only a car that is strictly slower to arrive than every car ahead starts a new fleet.
complexity: { time: "O(n log n)", space: "O(n)" }
---

`n` cars drive along a one-lane road towards a destination at mile `target`. Car `i` starts at mile `position[i]` and drives at constant speed `speed[i]` miles per hour.

Cars cannot pass each other. When a faster car catches up with a slower one, it slows down and the two continue together as one **fleet** at the slower speed. A single car on its own is also a fleet. If a car catches a fleet exactly at the destination, it counts as part of that fleet.

Return how many fleets arrive at the destination.

## Constraints

- `n === position.length === speed.length`
- `1 <= n <= 10^5`
- `0 < target <= 10^6`
- `0 <= position[i] < target`, and all positions are distinct.
- `0 < speed[i] <= 10^6`
