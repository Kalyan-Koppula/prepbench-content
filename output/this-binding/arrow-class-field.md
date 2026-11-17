---
title: Arrow functions as class fields
difficulty: Medium
order: 3
tags: [arrow-functions, classes]
frequency: high
expected: |
  false true
  false false
---

```js
class Toggle {
  on = false
  flip = () => (this.on = !this.on)
}

const a = new Toggle()
const b = new Toggle()

const flip = a.flip
flip()
flip()
b.flip.call(a)

console.log(a.on, b.on)
console.log(a.flip === b.flip, 'flip' in Toggle.prototype)
```

## Explanation

A class field initialiser runs inside the constructor, once per instance. An arrow created there captures that instance as its `this` permanently.

1. `flip` is `a`'s arrow, detached. It still flips `a.on`: `true`, then back to `false`.
2. `b.flip.call(a)` tries to pass `a` as `this`, but arrows ignore the `thisArg` of `call`/`apply`/`bind`. It flips `b.on` to `true`.
3. So the first line is `false true`.
4. Each instance got its own arrow function, so `a.flip === b.flip` is `false`. Fields are own properties, not prototype methods, so `'flip' in Toggle.prototype` is `false`.

Rule to remember: arrow fields never lose `this` (good for callbacks), but they cost one function per instance and can't be rebound.
