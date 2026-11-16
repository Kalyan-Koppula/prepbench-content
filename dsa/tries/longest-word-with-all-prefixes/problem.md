---
title: Longest Word With All Prefixes
difficulty: Medium
order: 3
lists: [striver]
tags: [trie, string]
function: longestCompleteWord
params:
  - { name: words, type: "string[]" }
returns: string
hints:
  - For a word of length `L`, you need to check its `L - 1` proper prefixes. How can you check them all in one walk?
  - Insert every word into a trie. A word qualifies when every node along its path is marked as the end of some word.
complexity: { time: "O(S)", space: "O(S)" }
---

You're given a list of lowercase `words`. Call a word **complete** if every one of its non-empty prefixes — including the word itself — appears in `words`. For example, `"cat"` is complete only if `"c"`, `"ca"` and `"cat"` are all in the list.

Return the longest complete word. If several complete words share the maximum length, return the lexicographically smallest of them. If no word is complete, return `""`.

## Constraints

- `1 <= words.length <= 10^5`
- `1 <= words[i].length`
- The total length `S` of all words is at most `10^5`.
- `words[i]` contains only lowercase English letters; the list may contain duplicates.
