---
title: Minimum Platforms
difficulty: Medium
order: 11
lists: [striver]
tags: [greedy, sorting, two-pointers, sweep-line]
function: findPlatform
params:
  - { name: arrival, type: "number[]" }
  - { name: departure, type: "number[]" }
returns: number
hints:
  - The answer is the largest number of trains present at the station at the same moment.
  - "Sort arrivals and departures separately and sweep both with two pointers, like merging two sorted lists."
  - "Watch the tie: a train that arrives at the same time another departs still needs its own platform."
complexity: { time: "O(n log n)", space: "O(n)" }
---

A station serves `n` trains in one day. Train `i` arrives at `arrival[i]` and leaves at `departure[i]`, both written as 24-hour `HHMM` integers (`905` is 9:05, `1730` is 17:30).

A train occupies its platform from its arrival time through its departure time **inclusive**, so if one train departs at the same minute another arrives, they need different platforms. Return the minimum number of platforms needed so that no train ever waits.

## Constraints

- `1 <= n <= 5 * 10^4`, `arrival.length === departure.length === n`
- `0 <= arrival[i] <= departure[i] <= 2359`, and both are valid `HHMM` times.
