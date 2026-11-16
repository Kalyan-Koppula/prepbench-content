---
title: Longest Repeating Character Replacement
difficulty: Medium
order: 3
lists: [neetcode150]
tags: [sliding-window, counting]
leetcode: longest-repeating-character-replacement
function: characterReplacement
params:
  - { name: s, type: string }
  - { name: k, type: number }
returns: number
hints:
  - For a fixed window, how many characters must change to make it all one letter?
  - A window is fixable when `length - (count of its most frequent letter) <= k`.
  - The most-frequent count never needs to decrease — the answer only grows when it grows.
complexity: { time: "O(n)", space: "O(26)" }
---

You're given a string `s` of uppercase English letters and an integer `k`. You may change **at most `k`** characters of `s`, each to any uppercase letter.

Return the length of the longest substring that can be made to consist of a single repeated letter.

## Constraints

- `1 <= s.length <= 10^5`
- `s` contains only uppercase English letters.
- `0 <= k <= s.length`
