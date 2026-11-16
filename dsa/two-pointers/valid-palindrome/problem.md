---
title: Valid Palindrome
difficulty: Easy
order: 1
lists: [neetcode150]
tags: [two-pointers, string]
leetcode: valid-palindrome
function: isPalindrome
params:
  - { name: s, type: string }
returns: boolean
hints:
  - Compare characters from both ends moving inward.
  - Skip anything that isn't a letter or digit, and compare letters case-insensitively — without building a new string.
complexity: { time: "O(n)", space: "O(1)" }
---

Given a string `s` of printable ASCII characters, decide whether it reads the same forwards and backwards once you ignore every character that is not a letter or a digit and treat uppercase and lowercase letters as equal.

Return `true` if it does, `false` otherwise. A string with no letters or digits counts as a palindrome.

## Constraints

- `1 <= s.length <= 2 * 10^5`
- `s` contains printable ASCII characters only.
