---
title: Letter Combinations of a Phone Number
difficulty: Medium
order: 6
lists: [neetcode150]
tags: [backtracking, string]
leetcode: letter-combinations-of-a-phone-number
function: letterCombinations
params:
  - { name: digits, type: string }
returns: "string[]"
compare: unordered
hints:
  - Each digit contributes one letter, chosen independently of the others — the answer is a cartesian product.
  - Recurse on the digit index, appending each of that digit's letters in turn.
complexity: { time: "O(n · 4^n)", space: "O(n)" }
---

On a classic phone keypad, the digits `2`–`9` each map to letters:

| Digit | Letters | Digit | Letters |
|---|---|---|---|
| 2 | `abc` | 6 | `mno` |
| 3 | `def` | 7 | `pqrs` |
| 4 | `ghi` | 8 | `tuv` |
| 5 | `jkl` | 9 | `wxyz` |

Given a string `digits`, return every string that can be spelled by picking one letter for each digit, in the same order as the digits. Return the strings in any order. If `digits` is empty, return an empty list.

## Constraints

- `0 <= digits.length <= 4`
- Every character of `digits` is in `'2'`–`'9'`.
