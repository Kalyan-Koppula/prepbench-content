---
title: Valid Anagram
difficulty: Easy
order: 3
lists: [neetcode150]
tags: [hash-map, counting]
leetcode: valid-anagram
function: isAnagram
params:
  - { name: s, type: string }
  - { name: t, type: string }
returns: boolean
hints:
  - Two strings are anagrams when every letter appears the same number of times in both.
  - With only 26 possible letters, a fixed-size count array is enough — add for one string, subtract for the other.
complexity: { time: "O(n)", space: "O(1)" }
---

Given two strings `s` and `t`, return `true` if `t` can be formed by rearranging all the letters of `s` (each letter used exactly as many times as it appears), and `false` otherwise.

## Constraints

- `1 <= s.length, t.length <= 5 * 10^4`
- `s` and `t` contain only lowercase English letters.

**Follow-up:** how would you adapt it if the inputs could contain arbitrary Unicode characters?
