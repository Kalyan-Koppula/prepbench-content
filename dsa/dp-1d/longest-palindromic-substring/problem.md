---
title: Longest Palindromic Substring
difficulty: Medium
order: 11
lists: [neetcode150, striver]
tags: [dp, string, two-pointers]
leetcode: longest-palindromic-substring
function: longestPalindrome
params:
  - { name: s, type: string }
returns: string
hints:
  - Every palindrome mirrors around a centre — either one character or the gap between two.
  - There are only `2n - 1` centres; expand outward from each while the ends match.
  - To keep the leftmost answer, scan centres left to right and replace the best only when strictly longer.
complexity: { time: "O(n²)", space: "O(1)" }
---

Given a string `s`, return its longest substring that reads the same forwards and backwards.

If several palindromic substrings share the maximum length, return the one that starts **earliest** in `s`.

## Constraints

- `1 <= s.length <= 1000`
- `s` consists of English letters and digits.
