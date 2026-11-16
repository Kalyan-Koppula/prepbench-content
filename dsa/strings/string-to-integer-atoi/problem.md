---
title: String to Integer (atoi)
difficulty: Medium
order: 4
lists: [striver]
tags: [string, parsing]
leetcode: string-to-integer-atoi
function: myAtoi
params:
  - { name: s, type: string }
returns: number
hints:
  - Treat it as a tiny state machine — spaces, then an optional sign, then digits — and stop at the first character that doesn't fit.
  - Accumulate digits left to right, and clamp as soon as the magnitude passes the 32-bit limit for the current sign.
complexity: { time: "O(n)", space: "O(1)" }
---

Implement `myAtoi(s)`, which reads a 32-bit signed integer from the start of `s` using these rules, in order:

1. Skip any leading space characters `' '` (only spaces).
2. If the next character is `'+'` or `'-'`, consume it and use it as the sign; otherwise the number is positive. At most one sign is allowed.
3. Read consecutive digits `0`–`9` until a non-digit or the end of the string. Leading zeros are allowed. Everything after this point is ignored.
4. If no digits were read, the result is `0`.
5. If the value is outside `[-2^31, 2^31 - 1]`, clamp it to the nearest bound.

Return the resulting integer. Do not use built-in parsing such as `parseInt` or `Number`.

## Constraints

- `0 <= s.length <= 200`
- `s` contains English letters, digits, `' '`, `'+'`, `'-'` and `'.'`.
