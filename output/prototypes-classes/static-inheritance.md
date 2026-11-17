---
title: Static properties and subclasses
difficulty: Medium
order: 7
tags: [classes, static, inheritance]
frequency: medium
expected: |
  3 3
  3 0
  undefined
---

```js
class Counter {
  static instances = 0
  constructor() {
    Counter.instances++
  }
  static reset() {
    this.instances = 0
  }
}

class Sub extends Counter {}

new Counter()
new Sub()
new Sub()

console.log(Counter.instances, Sub.instances)

Sub.reset()
console.log(Counter.instances, Sub.instances)
console.log(typeof new Counter().instances)
```

## Explanation

Static members live on the class object itself. `extends` also links the classes: `Object.getPrototypeOf(Sub) === Counter`, so `Sub` inherits statics through the prototype chain.

1. All three constructions increment `Counter.instances` (the constructor names `Counter` explicitly): `3`. `Sub.instances` has no own value and reads `Counter`'s: `3 3`.
2. `Sub.reset()` runs with `this = Sub`. Assigning creates an **own** `instances` on `Sub`, shadowing the inherited one. `Counter` is untouched: `3 0`.
3. Instances don't see statics at all; an instance's chain goes through `Counter.prototype`, not `Counter`: `undefined`.

Rule to remember: statics are inherited by subclasses (read through the chain), shadowed on write, and never visible on instances.
