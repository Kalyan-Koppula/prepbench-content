---
title: Permutation in String
difficulty: Medium
order: 4
lists: [neetcode150]
tags: [sliding-window, counting]
leetcode: permutation-in-string
function: checkInclusion
params:
  - { name: s1, type: string }
  - { name: s2, type: string }
returns: boolean
hints:
  - A rearrangement of `s1` has exactly the same letter counts as `s1` and the same length.
  - Slide a window of length `s1.length` over `s2` and keep its letter counts up to date in O(1) per step.
  - Track how many of the 26 letters currently have matching counts instead of comparing whole arrays.
complexity: { time: "O(n)", space: "O(26)" }
---

Given two strings `s1` and `s2`, return `true` if some **contiguous** substring of `s2` is a rearrangement of `s1` (uses exactly the same letters with the same multiplicities), and `false` otherwise.

## Constraints

- `1 <= s1.length, s2.length <= 10^4`
- Both strings contain only lowercase English letters.
