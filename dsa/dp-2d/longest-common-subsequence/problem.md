---
title: Longest Common Subsequence
difficulty: Medium
order: 4
lists: [neetcode150, striver]
tags: [dp, string, two-sequences]
leetcode: longest-common-subsequence
function: longestCommonSubsequence
params:
  - { name: text1, type: string }
  - { name: text2, type: string }
returns: number
hints:
  - Compare the last characters of the two prefixes. If they match, they can end the common subsequence together.
  - If they don't, one of them is useless at the end — drop it from one string or the other.
  - "`dp[i][j]` for prefixes of length `i` and `j`; row `i` only needs row `i - 1`."
complexity: { time: "O(m · n)", space: "O(min(m, n))" }
---

Given two strings `text1` and `text2`, return the length of the longest string that is a **subsequence** of both. Return `0` if they share no characters.

A subsequence is formed by deleting zero or more characters without reordering the rest.

## Constraints

- `1 <= text1.length, text2.length <= 1000`
- Both strings consist of lowercase English letters.
