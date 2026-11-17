---
title: Strict mode and primitive this
difficulty: Hard
order: 10
tags: [strict-mode, default-binding, call-apply-bind]
frequency: medium
expected: |
  object
  undefined
  object
  number
  object
  global object
---

```js
var tag = 'global object'

function sloppy() {
  return typeof this
}

function strict() {
  'use strict'
  return typeof this
}

console.log(sloppy())
console.log(strict())
console.log(sloppy.call(7))
console.log(strict.call(7))
console.log(strict.call(null))

function readTag() {
  return this.tag
}
console.log(readTag.call(null))
```

## Explanation

Sloppy and strict functions treat `this` differently when the caller doesn't provide a proper object.

1. `sloppy()`: no receiver, so sloppy mode substitutes the global object: `object`.
2. `strict()`: strict mode leaves `this` as given, which is `undefined`.
3. `sloppy.call(7)`: sloppy mode **boxes** primitives, so `this` is a `Number` wrapper object: `object`.
4. `strict.call(7)`: strict mode keeps the primitive: `number`.
5. `strict.call(null)`: `this` is exactly `null`, and `typeof null` is `object` (the old quirk, not the global object).
6. `readTag.call(null)` is sloppy too, and sloppy mode replaces `null`/`undefined` with the global object. The top-level `var tag` is a property of that object: `global object`.

Rule to remember: strict mode passes `this` through untouched; sloppy mode turns `null`/`undefined` into the global object and boxes primitives.
