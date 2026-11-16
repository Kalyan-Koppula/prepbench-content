---
title: Word Break
difficulty: Medium
order: 8
lists: [neetcode150, striver]
tags: [dp, string, hash-set]
leetcode: word-break
function: wordBreak
params:
  - { name: s, type: string }
  - { name: wordDict, type: "string[]" }
returns: boolean
hints:
  - If the prefix `s[0..j)` can be split and `s[j..i)` is a dictionary word, then `s[0..i)` can be split.
  - "`ok[i]` = can the first `i` characters be split? `ok[0]` is true."
  - Only look back as far as the longest dictionary word.
complexity: { time: "O(n · L²)", space: "O(n + total dict size)" }
---

Given a string `s` and a list of dictionary words `wordDict`, decide whether `s` can be cut into a sequence of one or more pieces where every piece is a word from the dictionary.

A word may be used any number of times. Return `true` or `false`.

## Constraints

- `1 <= s.length <= 300`
- `1 <= wordDict.length <= 1000`
- `1 <= wordDict[i].length <= 20`
- `s` and every word consist of lowercase English letters; the words are distinct.
