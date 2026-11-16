---
title: Word Search
difficulty: Medium
order: 7
lists: [neetcode150, striver]
tags: [backtracking, dfs, matrix]
leetcode: word-search
function: exist
params:
  - { name: board, type: "string[][]" }
  - { name: word, type: string }
returns: boolean
hints:
  - Try every cell as the start of the word, then extend one letter at a time to a neighbouring cell.
  - Mark cells on the current path so they aren't reused, and unmark them when you backtrack.
complexity: { time: "O(m · n · 3^L)", space: "O(L)" }
---

You're given an `m x n` grid `board` of letters and a string `word`. Return `true` if `word` can be spelled by a path through the grid, otherwise `false`.

The path starts at any cell, moves only between horizontally or vertically adjacent cells, and may not visit the same cell twice.

## Constraints

- `1 <= m, n <= 6`
- `1 <= word.length <= 15`
- `board` and `word` contain only English letters (case-sensitive).

**Follow-up:** what cheap checks could you run before searching to rule out hopeless inputs quickly?
