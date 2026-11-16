---
title: Word Search II
difficulty: Hard
order: 5
lists: [neetcode150]
tags: [trie, backtracking, dfs, matrix]
leetcode: word-search-ii
function: findWords
params:
  - { name: board, type: "string[][]" }
  - { name: words, type: "string[]" }
returns: "string[]"
compare: unordered
hints:
  - Running a separate grid search per word repeats the same exploration for words sharing a prefix.
  - Put all the words in a trie and run one DFS from each cell, moving through the trie as you move through the grid. Stop as soon as the current path is not a prefix of any word.
  - Store the complete word on its end node, and clear it once found so it isn't reported twice.
complexity: { time: "O(m · n · 4 · 3^(L-1))", space: "O(total characters in words)" }
---

You're given an `m x n` grid `board` of lowercase letters and a list of distinct `words`.

A word can be **traced** on the board if its letters can be visited in order by moving between horizontally or vertically adjacent cells, without using any cell more than once in that word.

Return every word from `words` that can be traced, each exactly once, in any order.

## Constraints

- `1 <= m, n <= 12`
- `1 <= words.length <= 3 * 10^4`
- `1 <= words[i].length <= 10`
- `board[i][j]` and `words[i]` contain only lowercase English letters.
- All `words` are distinct.
