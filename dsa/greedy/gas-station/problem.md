---
title: Gas Station
difficulty: Medium
order: 4
lists: [neetcode150]
tags: [greedy, prefix-sum]
leetcode: gas-station
function: canCompleteCircuit
params:
  - { name: gas, type: "number[]" }
  - { name: cost, type: "number[]" }
returns: number
hints:
  - If the total fuel is less than the total cost, no start works. Otherwise, one does.
  - "If you start at `s` and run dry before reaching `j`, no station between `s` and `j` can be the start either."
complexity: { time: "O(n)", space: "O(1)" }
---

There are `n` fuel stations arranged in a circle. Station `i` gives you `gas[i]` units of fuel, and driving from station `i` to station `(i + 1) % n` burns `cost[i]` units.

Your car starts empty at a station of your choice and its tank has no capacity limit. Return the index of the starting station from which you can drive one full lap clockwise without the tank ever going negative, or `-1` if no such station exists.

## Constraints

- `1 <= n <= 10^5`, `gas.length === cost.length === n`
- `0 <= gas[i], cost[i] <= 10^4`
- If a valid start exists, it is unique.
