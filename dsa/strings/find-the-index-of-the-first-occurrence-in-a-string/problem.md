---
title: Find the Index of the First Occurrence in a String
difficulty: Medium
order: 5
lists: [striver]
tags: [string-matching, kmp]
leetcode: find-the-index-of-the-first-occurrence-in-a-string
function: strStr
params:
  - { name: haystack, type: string }
  - { name: needle, type: string }
returns: number
hints:
  - The naive check of every start position is `O(n · m)`. What information does a partial match give you that the naive approach throws away?
  - Precompute, for each prefix of `needle`, the longest proper prefix that is also a suffix (KMP). On a mismatch, fall back to that length instead of restarting.
complexity: { time: "O(n + m)", space: "O(m)" }
---

Given two strings `haystack` and `needle`, return the smallest index `i` such that `needle` appears in `haystack` starting at position `i`. Return `-1` if `needle` never appears.

Don't use built-ins such as `indexOf`, `includes` or `search` — the point is to implement the matching.

## Constraints

- `1 <= haystack.length, needle.length <= 10^4`
- Both strings contain only lowercase English letters.

**Follow-up:** can you guarantee `O(n + m)` time even for inputs like `haystack = "aaaa…ab"`, `needle = "aa…ab"`?
