---
title: Design Add and Search Words Data Structure
difficulty: Medium
order: 2
lists: [neetcode150]
tags: [trie, dfs, design]
leetcode: design-add-and-search-words-data-structure
kind: class
class: WordDictionary
params: []
methods:
  - name: addWord
    params: [{ name: word, type: string }]
    returns: void
  - name: search
    params: [{ name: pattern, type: string }]
    returns: boolean
hints:
  - Without wildcards this is a plain trie lookup. What changes when one position can be any letter?
  - At a `.`, try every child of the current node and recurse on the rest of the pattern; succeed if any branch does.
complexity: { time: "O(L) to add; O(26^d · L) to search with d dots", space: "O(total added characters)" }
---

Design a dictionary of lowercase words that supports pattern lookups.

- `addWord(word)` stores `word`.
- `search(pattern)` returns `true` if some stored word has the same length as `pattern` and matches it position by position. A `.` in `pattern` matches any single letter; every other character must match exactly.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= word.length <= 25`
- Words added contain only lowercase English letters.
- Search patterns contain lowercase letters or `.`, with at most 2 dots.
- At most `10^4` calls in total.
