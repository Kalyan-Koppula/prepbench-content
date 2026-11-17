---
title: An object with no prototype
difficulty: Medium
order: 12
tags: [object-create, prototype-chain]
frequency: medium
expected: |
  false true
  undefined
  true
  TypeError
  false null
---

```js
const dict = Object.create(null)
dict.apple = 1

console.log('toString' in dict, 'toString' in {})
console.log(typeof dict.hasOwnProperty)
console.log(Object.hasOwn(dict, 'apple'))

try {
  console.log(`${dict}`)
} catch (e) {
  console.log(e.name)
}

console.log(dict instanceof Object, Object.getPrototypeOf(dict))
```

## Explanation

`Object.create(null)` makes an object whose chain ends immediately: it doesn't inherit from `Object.prototype`.

1. A normal `{}` inherits `toString`; `dict` doesn't: `false true`.
2. No inherited `hasOwnProperty` either: `undefined`. That's why `Object.hasOwn(obj, key)` exists; it works on any object: `true`.
3. A template literal needs a string, so it looks for `Symbol.toPrimitive`, `toString` and `valueOf`. `dict` has none, so the conversion throws a `TypeError`.
4. `instanceof Object` looks for `Object.prototype` in the chain, which is empty: `false`. The prototype itself is `null`.

Rule to remember: null-prototype objects make safe dictionaries (no `__proto__` or `toString` keys to collide with) but lose every inherited helper.
