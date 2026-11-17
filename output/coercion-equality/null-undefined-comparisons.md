---
title: Relational comparisons with null and undefined
difficulty: Hard
order: 10
tags: [comparison, coercion]
frequency: medium
expected: |
  false false true
  false false false
  1 NaN
  true false true
---

```js
console.log(null > 0, null == 0, null >= 0)
console.log(undefined > 0, undefined == 0, undefined >= 0)
console.log(null + 1, undefined + 1)
console.log('b' > 'a', '10' > '9', 10 > '9')
```

## Explanation

`==` and the relational operators (`<`, `>`, `<=`, `>=`) are different algorithms.

1. Relational operators convert `null` to `0`. So `null > 0` is `0 > 0`, `false`. `null >= 0` is defined as "not `null < 0`", and `0 < 0` is false, so it's `true`. Meanwhile `null == 0` uses the `==` rule that `null` equals only `undefined`: `false`.
2. `undefined` converts to `NaN`, and every comparison with `NaN` is false, `>=` included.
3. Arithmetic uses the same conversions: `null + 1` is `1`, `undefined + 1` is `NaN`.
4. When **both** sides are strings, comparison is character by character. `'b' > 'a'` is `true`; `'10' > '9'` compares `'1'` with `'9'`: `false`. With a number on one side, the string becomes a number: `10 > 9`, `true`.

Rule to remember: `null` acts like `0` in `<`/`>` but not in `==`; `undefined` acts like `NaN`; two strings compare alphabetically.
