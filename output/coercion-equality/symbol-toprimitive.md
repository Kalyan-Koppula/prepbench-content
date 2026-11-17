---
title: Symbol.toPrimitive and its hints
difficulty: Hard
order: 12
tags: [to-primitive, symbols, coercion]
frequency: low
expected: |
  21 warm default
  42 true
  warm warm
---

```js
const temp = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 21
    if (hint === 'string') return 'warm'
    return 'default'
  },
  valueOf() {
    return 0
  },
}

console.log(+temp, `${temp}`, temp + '')
console.log(temp * 2, temp == 'default')
console.log([temp].join(), String([temp]))
```

## Explanation

If an object has a `Symbol.toPrimitive` method, every conversion calls it with the hint, and `valueOf`/`toString` are never consulted. That's why `valueOf` returning `0` never shows up.

1. Unary `+` asks for a number: `21`. A template literal asks for a string: `warm`. Binary `+` asks with `'default'` (it doesn't know yet whether it will add or concatenate): `default`.
2. `*` is purely numeric: `21 * 2` = `42`. `==` against a string uses `'default'`, which returns `'default'`: `true`.
3. `join` converts each element to a **string**, and `String([temp])` goes through the array's `toString`, which calls `join`: `warm warm`.

Rule to remember: `+` and `==` send the `'default'` hint, not `'number'`; only `Symbol.toPrimitive` can tell them apart.
