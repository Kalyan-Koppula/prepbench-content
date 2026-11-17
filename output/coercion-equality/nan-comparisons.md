---
title: Comparing with NaN
difficulty: Medium
order: 5
tags: [nan, equality]
frequency: high
expected: |
  NaN number
  false false true
  true false
  true -1
---

```js
const n = Number('abc')

console.log(n, typeof n)
console.log(n === n, n == NaN, n !== n)
console.log(isNaN('abc'), Number.isNaN('abc'))
console.log([NaN].includes(NaN), [NaN].indexOf(NaN))
```

## Explanation

1. A failed numeric conversion gives `NaN`, which is a value of type `number`.
2. `NaN` is not equal to anything, including itself, under `==` or `===`. That makes `n !== n` `true`: the old-school NaN test.
3. Global `isNaN` first **converts** its argument, so `isNaN('abc')` is `true` even though `'abc'` is a string. `Number.isNaN` doesn't convert; it's `true` only for the actual `NaN` value: `false`.
4. `includes` uses **SameValueZero**, which treats `NaN` as equal to `NaN`: `true`. `indexOf` uses `===`, so it never finds `NaN`: `-1`.

Rule to remember: test with `Number.isNaN`; `===` and `indexOf` can't see `NaN`, `includes` and `Object.is` can.
