---
title: == vs === on everyday values
difficulty: Easy
order: 1
tags: [equality, coercion]
frequency: high
expected: |
  true false
  true true false
  true false
  false false
---

```js
console.log(1 == '1', 1 === '1')
console.log(0 == '', 0 == '0', '' == '0')
console.log(null == undefined, null === undefined)
console.log(null == 0, undefined == false)
```

## Explanation

`===` never converts: different types means `false`. `==` converts by a short set of rules.

1. Number vs string: the string becomes a number. `'1'` → `1`, so `true`; strictly, `false`.
2. `''` → `0` and `'0'` → `0`, so both equal `0`. But `'' == '0'` compares two **strings**, no conversion, and they differ: `false`. Loose equality isn't even transitive.
3. `null == undefined` is a special case: `true`. They are different types, so `===` is `false`.
4. `null` and `undefined` are loosely equal **only** to each other. Neither is converted to a number here, so `null == 0` and `undefined == false` are both `false`.

Rule to remember: `==` turns strings and booleans into numbers, but `null`/`undefined` equal only each other.
