---
title: Longest Substring Without Repeating Characters
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [sliding-window, hash-map]
leetcode: longest-substring-without-repeating-characters
function: lengthOfLongestSubstring
params:
  - { name: s, type: string }
returns: number
hints:
  - Keep a window that never contains a duplicate. What do you do when the next character is already inside it?
  - Store the last index where each character appeared, so the left edge can jump straight past the duplicate.
complexity: { time: "O(n)", space: "O(min(n, alphabet))" }
---

Given a string `s`, return the length of the longest **substring** (a contiguous run of characters) in which no character appears more than once.

## Constraints

- `0 <= s.length <= 5 * 10^4`
- `s` contains English letters, digits, symbols and spaces.
