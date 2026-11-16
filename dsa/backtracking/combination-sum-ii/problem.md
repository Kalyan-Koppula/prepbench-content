---
title: Combination Sum II
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [backtracking, sorting]
leetcode: combination-sum-ii
function: combinationSum2
params:
  - { name: candidates, type: "number[]" }
  - { name: target, type: number }
returns: "number[][]"
compare: unordered-nested
hints:
  - Each position may be used at most once, so recurse with `i + 1`. But equal values at different positions can still produce the same combination twice.
  - Sort, and at each level skip a value equal to the one just tried at that same level (`i > start && c[i] === c[i - 1]`).
complexity: { time: "O(n · 2^n)", space: "O(n)" }
---

You're given an array of positive integers `candidates` (which **may contain duplicates**) and a positive integer `target`. Return every distinct combination of candidates that adds up to `target`, where each array position can be used **at most once**.

Two combinations are the same if they contain the same values with the same multiplicities. Return them in any order; the order of values inside a combination does not matter.

## Constraints

- `1 <= candidates.length <= 100`
- `1 <= candidates[i] <= 50`
- `1 <= target <= 30`
