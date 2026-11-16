---
title: Decode Ways
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [dp, string]
leetcode: decode-ways
function: numDecodings
params:
  - { name: s, type: string }
returns: number
hints:
  - The last letter of a decoding uses either the last one digit or the last two digits.
  - A single digit is valid unless it is `0`; a pair is valid if it lies between `10` and `26`.
  - "`ways[i]` depends only on `ways[i - 1]` and `ways[i - 2]`."
complexity: { time: "O(n)", space: "O(1)" }
---

A message of capital letters was encoded by replacing each letter with its position in the alphabet: `A → "1"`, `B → "2"`, …, `Z → "26"`, and concatenating the results. Separators were lost, so a digit string can often be read back in several ways.

Given the digit string `s`, return how many different letter sequences could have produced it. Every letter must map to exactly `"1"`…`"26"` — a code with a leading zero such as `"06"` is not valid. If no reading exists, return `0`.

## Constraints

- `1 <= s.length <= 100`
- `s` contains only digits and may start with `0`.
- The answer fits in a 32-bit signed integer.
