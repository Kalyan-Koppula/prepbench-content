---
title: Palindromic Substrings
difficulty: Medium
order: 12
lists: [neetcode150]
tags: [dp, string, two-pointers]
leetcode: palindromic-substrings
function: countSubstrings
params:
  - { name: s, type: string }
returns: number
hints:
  - Each palindromic substring has a unique centre — a character or a gap between two characters.
  - Expand from each of the `2n - 1` centres; every successful step outward is one more palindrome.
complexity: { time: "O(n²)", space: "O(1)" }
---

Given a string `s`, count how many of its substrings are palindromes.

Substrings are counted by position: two substrings with the same text but different start or end indices count separately. Every single character is a palindrome.

## Constraints

- `1 <= s.length <= 1000`
- `s` consists of lowercase English letters.
