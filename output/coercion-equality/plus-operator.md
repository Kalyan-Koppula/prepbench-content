---
title: + and - with strings
difficulty: Easy
order: 3
tags: [coercion, operators]
frequency: high
expected: |
  12 2 12
  33 123
  42 NaN 0
  5-2
---

```js
console.log(1 + '2', '3' - 1, '3' * '4')
console.log(1 + 2 + '3', '1' + 2 + 3)
console.log(+'42', +'4px', +'')
console.log('5' + - '2')
```

## Explanation

`+` is both addition and concatenation: if either side is a string, it concatenates. Every other arithmetic operator converts to numbers.

1. `1 + '2'` concatenates: `12`. `'3' - 1` and `'3' * '4'` are numeric: `2` and `12`.
2. `+` evaluates left to right. `1 + 2` is `3`, then `3 + '3'` is `'33'`. In `'1' + 2 + 3`, the first step already produces a string, so it's `'12' + 3` = `'123'`.
3. Unary `+` converts to a number: `42`; `'4px'` isn't a valid number: `NaN`; the empty string is `0`.
4. `- '2'` is a unary minus, giving the number `-2`. Then `'5' + -2` concatenates: `5-2`.

Rule to remember: one string anywhere in a left-to-right `+` chain turns the rest into concatenation; `-`, `*`, `/` and unary `+` always mean numbers.
