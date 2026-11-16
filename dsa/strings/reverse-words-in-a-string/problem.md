---
title: Reverse Words in a String
difficulty: Medium
order: 3
lists: [striver]
tags: [string, two-pointers]
leetcode: reverse-words-in-a-string
function: reverseWords
params:
  - { name: s, type: string }
returns: string
hints:
  - A word is a maximal run of non-space characters. Extra spaces anywhere must disappear.
  - Scan from the right end, collect each word as you pass it, and join them with single spaces.
complexity: { time: "O(n)", space: "O(n)" }
---

You're given a string `s` made of words separated by spaces, where a word is a maximal run of non-space characters. `s` may have leading or trailing spaces and several spaces between words.

Return a string with the words in reverse order, separated by exactly one space, with no leading or trailing spaces.

## Constraints

- `1 <= s.length <= 10^4`
- `s` contains English letters, digits and spaces `' '`.
- `s` contains at least one word.

**Follow-up:** if strings were mutable character arrays, could you do it in place with `O(1)` extra space?
