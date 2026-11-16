---
title: Combination Sum
difficulty: Medium
order: 3
lists: [neetcode150, striver]
tags: [backtracking]
leetcode: combination-sum
function: combinationSum
params:
  - { name: candidates, type: "number[]" }
  - { name: target, type: number }
returns: "number[][]"
compare: unordered-nested
hints:
  - To avoid producing `[2, 3]` and `[3, 2]` separately, only ever pick candidates at or after the index of the last pick.
  - Since a candidate can repeat, recurse with the same index after choosing it. Sorting lets you stop the loop as soon as a candidate exceeds what's left.
complexity: { time: "O(n^(T/m))", space: "O(T/m)" }
---

You're given an array of **distinct** positive integers `candidates` and a positive integer `target`. Return every distinct combination of candidates whose values add up to `target`. The same candidate may be used **any number of times**.

Two combinations are the same if they use each candidate the same number of times. Return them in any order; the order of values inside a combination does not matter.

## Constraints

- `1 <= candidates.length <= 30`
- `2 <= candidates[i] <= 40`, all distinct
- `1 <= target <= 40`
- The answer contains fewer than `200` combinations.
