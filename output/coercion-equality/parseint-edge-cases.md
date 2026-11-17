---
title: parseInt vs Number
difficulty: Hard
order: 9
tags: [numbers, parsing]
frequency: medium
expected: |
  12 NaN
  31 31
  NaN 0
  5
  1,NaN,3
---

```js
console.log(parseInt('12px'), Number('12px'))
console.log(parseInt('0x1F'), parseInt('1F', 16))
console.log(parseInt(''), Number(''))
console.log(parseInt(0.0000005))
console.log(['1', '7', '11'].map(parseInt).join(','))
```

## Explanation

`parseInt` reads a **string** from the left and stops at the first character that doesn't fit; `Number` requires the whole string to be a number.

1. `parseInt('12px')` stops at `p`: `12`. `Number('12px')` rejects the whole thing: `NaN`.
2. `parseInt` recognises a `0x` prefix as hex; with an explicit radix of 16 you don't need it. Both are `31`.
3. With no digits at all, `parseInt('')` is `NaN`, but `Number('')` treats an empty (or whitespace-only) string as `0`.
4. `parseInt` converts a number argument to a string first. `0.0000005` stringifies as `'5e-7'`, and parsing stops at `e`: `5`.
5. `map` passes `(value, index)`, and `parseInt` takes `index` as the **radix**. `parseInt('1', 0)` treats radix 0 as "default": `1`. Radix `1` is invalid: `NaN`. `parseInt('11', 2)` is binary: `3`.

Rule to remember: `parseInt` is for strings, always with an explicit radix, and never passed straight to `map`; use `Number` when the whole string must be numeric.
