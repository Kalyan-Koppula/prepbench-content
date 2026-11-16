---
title: Edit Distance
difficulty: Medium
order: 10
lists: [neetcode150, striver]
tags: [dp, string, two-sequences]
leetcode: edit-distance
function: minDistance
params:
  - { name: word1, type: string }
  - { name: word2, type: string }
returns: number
hints:
  - Compare the last characters of the two prefixes. If they're equal, no operation is needed for them.
  - Otherwise the last operation was an insert, a delete or a replace — each shrinks one or both prefixes by one.
  - "`dp[0][j] = j` and `dp[i][0] = i`: turning a prefix into the empty string (or back) costs its length."
complexity: { time: "O(m · n)", space: "O(n)" }
---

You may edit a string with three operations, each costing 1:

- insert one character anywhere,
- delete one character,
- replace one character with another.

Return the minimum number of operations needed to turn `word1` into `word2`.

## Constraints

- `0 <= word1.length, word2.length <= 500`
- Both strings consist of lowercase English letters.
