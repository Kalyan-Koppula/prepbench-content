---
title: Roman to Integer
difficulty: Easy
order: 2
lists: [striver]
tags: [string, hash-map]
leetcode: roman-to-integer
function: romanToInt
params:
  - { name: s, type: string }
returns: number
hints:
  - Normally you just add each symbol's value. When is a symbol subtracted instead?
  - A symbol is subtracted exactly when the symbol after it is larger.
complexity: { time: "O(n)", space: "O(1)" }
---

Roman numerals use seven symbols: `I` = 1, `V` = 5, `X` = 10, `L` = 50, `C` = 100, `D` = 500, `M` = 1000. Symbols are usually written from largest to smallest and added together (`XVI` = 16). Six combinations instead place a smaller symbol before a larger one to subtract it: `IV` = 4, `IX` = 9, `XL` = 40, `XC` = 90, `CD` = 400, `CM` = 900.

Given a valid Roman numeral `s`, return its integer value.

## Constraints

- `1 <= s.length <= 15`
- `s` uses only the characters `I V X L C D M`.
- `s` is a valid Roman numeral for a value in `[1, 3999]`.
