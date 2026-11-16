---
title: Word Ladder
difficulty: Hard
order: 15
lists: [neetcode150, striver]
tags: [bfs, string]
leetcode: word-ladder
function: ladderLength
params:
  - { name: beginWord, type: string }
  - { name: endWord, type: string }
  - { name: wordList, type: "string[]" }
returns: number
hints:
  - Each word is a node; two words are joined by an edge when they differ in exactly one position. You want a shortest path.
  - Comparing every pair of words is slow. Bucket words by patterns like `h*t` so all one-letter neighbours share a bucket.
  - BFS from `beginWord`; the level at which you first reach `endWord` is the answer.
complexity: { time: "O(n · L²)", space: "O(n · L²)" }
---

You're given two words `beginWord` and `endWord` of the same length and a dictionary `wordList`.

A **ladder** is a sequence of words starting with `beginWord` and ending with `endWord` in which each adjacent pair differs in exactly one letter, and every word after the first is in `wordList`. (`beginWord` itself does not need to be in the list.)

Return the number of words in the shortest ladder, counting both ends, or `0` if no ladder exists.

## Constraints

- `1 <= beginWord.length <= 10`; `endWord` and every word in `wordList` have the same length
- `1 <= wordList.length <= 5000`
- All words are lowercase English letters; words in `wordList` are distinct
- `beginWord != endWord`
