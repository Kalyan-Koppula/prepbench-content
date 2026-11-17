---
title: typeof quirks
difficulty: Easy
order: 7
tags: [typeof, types]
frequency: high
expected: |
  object
  object true
  function function
  number symbol bigint
  string
  object string
---

```js
console.log(typeof null)
console.log(typeof [], Array.isArray([]))
console.log(typeof function () {}, typeof class {})
console.log(typeof NaN, typeof Symbol('s'), typeof 10n)
console.log(typeof typeof 1)
console.log(typeof new String('x'), typeof String('x'))
```

## Explanation

1. `typeof null` is `'object'`, a bug from the first version of JavaScript that can never be fixed.
2. Arrays are objects to `typeof`; use `Array.isArray` to detect them.
3. Functions are the one kind of object `typeof` singles out, and classes are functions.
4. `NaN` is a `number`; symbols and BigInts have their own types.
5. `typeof` always returns a string, so `typeof typeof 1` is `typeof 'number'`: `string`.
6. `new String('x')` creates a wrapper **object**. `String('x')` without `new` is a conversion that returns a primitive.

Rule to remember: `typeof` lies about `null` and can't tell arrays from objects; check `x === null` and `Array.isArray(x)` explicitly.
