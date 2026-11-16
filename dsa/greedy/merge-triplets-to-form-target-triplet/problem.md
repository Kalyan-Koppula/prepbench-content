---
title: Merge Triplets to Form Target Triplet
difficulty: Medium
order: 6
lists: [neetcode150]
tags: [greedy]
leetcode: merge-triplets-to-form-target-triplet
function: mergeTriplets
params:
  - { name: triplets, type: "number[][]" }
  - { name: target, type: "number[]" }
returns: boolean
hints:
  - Merging takes the element-wise maximum, so values can only grow. Which triplets are unsafe to ever touch?
  - "Ignore any triplet with a coordinate above the target's. Among the rest, check that each of the three target values is hit exactly by some triplet."
complexity: { time: "O(n)", space: "O(1)" }
---

You're given a list of triplets `triplets[i] = [a, b, c]` and a `target` triplet `[x, y, z]`.

You may repeatedly pick two triplets `i` and `j` and replace `triplets[j]` with their element-wise maximum: `[max(a_i, a_j), max(b_i, b_j), max(c_i, c_j)]`. Return `true` if, after any number of such merges (possibly none), some triplet in the list equals `target`.

## Constraints

- `1 <= triplets.length <= 10^5`
- `triplets[i].length === target.length === 3`
- `1 <= a, b, c, x, y, z <= 1000`
