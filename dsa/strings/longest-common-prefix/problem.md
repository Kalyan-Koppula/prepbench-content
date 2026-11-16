---
title: Longest Common Prefix
difficulty: Easy
order: 1
lists: [striver]
tags: [string, scanning]
leetcode: longest-common-prefix
function: longestCommonPrefix
params:
  - { name: strs, type: "string[]" }
returns: string
hints:
  - The answer can't be longer than the shortest string.
  - Compare column by column — character `i` of every string — and stop at the first mismatch or the end of any string.
complexity: { time: "O(S)", space: "O(1)" }
---

Given an array of strings `strs`, return the longest string that is a prefix of **every** element. Return `""` if they share no common prefix.

## Constraints

- `1 <= strs.length <= 200`
- `0 <= strs[i].length <= 200`
- `strs[i]` contains only lowercase English letters.
