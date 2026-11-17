---
title: Adding arrays and objects
difficulty: Medium
order: 4
tags: [coercion, to-primitive, operators]
frequency: high
expected: |
  ""
  [object Object]
  1,23
  [object Object]x
  ,,0
  null1
---

```js
console.log(JSON.stringify([] + []))
console.log([] + {})
console.log([1, 2] + [3])
console.log({} + 'x')
console.log(String([null, undefined, 0]))
console.log([] + null + 1)
```

## Explanation

When `+` sees an object, it first converts it to a primitive (`valueOf`, and if that returns an object, `toString`). For plain arrays and objects `valueOf` returns the object itself, so `toString` decides. Then, if either side is a string, it concatenates.

1. `[].toString()` is `''`, so `[] + []` is `''`. It's logged through `JSON.stringify` to make the empty string visible: `""`.
2. `({}).toString()` is `'[object Object]'`, so `'' + '[object Object]'`.
3. Arrays join with commas: `'1,2' + '3'` = `1,23`.
4. `{}` here is inside a function call, so it's an object literal, not a block: `[object Object]x`.
5. `Array.prototype.join` turns `null` and `undefined` into empty strings: `,,0`.
6. `[] + null` is `'' + null` = `'null'`, then `'null' + 1` = `null1`.

Rule to remember: arrays stringify by joining (with `null`/`undefined` as empty), plain objects become `[object Object]`, and then the string rule of `+` takes over.
