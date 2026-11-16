---
title: Palindrome Partitioning
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [backtracking, string, dp]
leetcode: palindrome-partitioning
function: partition
params:
  - { name: s, type: string }
returns: "string[][]"
compare: unordered
hints:
  - Decide the first piece, then solve the same problem for the rest of the string.
  - At index `start`, try every end `j` where `s[start..j]` is a palindrome, and recurse from `j + 1`.
  - Precompute a table `isPal[i][j]` so each palindrome check is O(1).
complexity: { time: "O(n · 2^n)", space: "O(n²)" }
---

Split the string `s` into one or more contiguous non-empty pieces such that **every piece is a palindrome** (reads the same forwards and backwards). Return every way of doing this.

Each partition is a list of pieces in left-to-right order. The partitions themselves may be returned in any order.

## Constraints

- `1 <= s.length <= 12`
- `s` contains only lowercase English letters.
