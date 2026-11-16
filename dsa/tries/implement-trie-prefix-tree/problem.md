---
title: Implement Trie (Prefix Tree)
difficulty: Medium
order: 1
lists: [neetcode150, striver]
tags: [trie, design]
leetcode: implement-trie-prefix-tree
kind: class
class: Trie
params: []
methods:
  - name: insert
    params: [{ name: word, type: string }]
    returns: void
  - name: search
    params: [{ name: word, type: string }]
    returns: boolean
  - name: startsWith
    params: [{ name: prefix, type: string }]
    returns: boolean
hints:
  - Each node represents a prefix; its children are the letters that can follow it.
  - A path existing is not the same as a word ending there — mark the node where each inserted word finishes.
complexity: { time: "O(L) per operation", space: "O(total inserted characters)" }
---

Build a prefix tree that stores lowercase words.

- `insert(word)` adds `word` to the structure.
- `search(word)` returns `true` only if `word` itself was inserted earlier.
- `startsWith(prefix)` returns `true` if at least one inserted word begins with `prefix`.

Each operation should take time proportional to the length of its argument, independent of how many words are stored.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `1 <= word.length, prefix.length <= 2000`
- Words and prefixes contain only lowercase English letters.
- At most `3 * 10^4` calls in total.
