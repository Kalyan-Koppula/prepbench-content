---
title: Reorganize String
difficulty: Medium
order: 6
lists: [extra]
tags: [heap, greedy, counting]
leetcode: reorganize-string
function: reorganizeString
params:
  - { name: s, type: string }
returns: string
compare: checker
hints:
  - When is it impossible? Think about the most frequent letter and how many gaps the other letters can create.
  - Greedily place the letter with the most copies left, as long as it differs from the letter you just placed. A max-heap keyed by count gives you that letter quickly.
complexity: { time: "O(n log 26)", space: "O(26)" }
---

Rearrange the letters of `s` so that no two neighbouring characters are equal. Return any such rearrangement, or `""` if none exists.

Any valid answer is accepted.

## Constraints

- `1 <= s.length <= 500`
- `s` contains only lowercase English letters.
