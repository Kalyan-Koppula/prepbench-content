---
title: Shortest Palindrome
difficulty: Hard
order: 6
lists: [striver]
tags: [string-matching, kmp, palindrome]
leetcode: shortest-palindrome
function: shortestPalindrome
params:
  - { name: s, type: string }
returns: string
hints:
  - Whatever you add goes in front, so part of `s` must stay as the palindrome's core. Which part?
  - Find the longest prefix of `s` that is a palindrome; the answer is the reverse of the rest, followed by `s`.
  - A prefix of `s` is a palindrome exactly when it equals a suffix of `reverse(s)`. The KMP prefix function of `s + '#' + reverse(s)` finds the longest one in linear time.
complexity: { time: "O(n)", space: "O(n)" }
---

Given a string `s`, you may only add characters to its **front**. Return the shortest palindrome you can produce this way.

## Constraints

- `0 <= s.length <= 5 * 10^4`
- `s` contains only lowercase English letters.
