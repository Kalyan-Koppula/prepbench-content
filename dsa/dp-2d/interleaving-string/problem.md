---
title: Interleaving String
difficulty: Medium
order: 9
lists: [neetcode150]
tags: [dp, string, two-sequences]
leetcode: interleaving-string
function: isInterleave
params:
  - { name: s1, type: string }
  - { name: s2, type: string }
  - { name: s3, type: string }
returns: boolean
hints:
  - If the lengths don't add up, the answer is immediately `false`.
  - After using `i` characters of `s1` and `j` of `s2`, you've built exactly `s3[0 .. i+j)`. The next character of `s3` must come from `s1[i]` or `s2[j]`.
  - "`ok[i][j]` depends on `ok[i-1][j]` and `ok[i][j-1]` — one row of length `s2.length + 1` suffices."
complexity: { time: "O(m · n)", space: "O(n)" }
---

Decide whether `s3` can be formed by **interleaving** `s1` and `s2`: walking through `s3` from left to right, every character is taken from the front of what remains of either `s1` or `s2`, so that both are used up completely and each keeps its own order.

Return `true` if such an interleaving exists, otherwise `false`. Either string may be empty.

## Constraints

- `0 <= s1.length, s2.length <= 100`
- `0 <= s3.length <= 200`
- All strings consist of lowercase English letters.

**Follow-up:** can you use only `O(s2.length)` extra memory?
