---
title: Changing the prototype after new
difficulty: Medium
order: 3
tags: [prototype-chain, constructors]
frequency: high
expected: |
  A drives
  A drives replaced
  true false
---

```js
function Car(model) {
  this.model = model
}

const early = new Car('A')

Car.prototype.drive = function () {
  return this.model + ' drives'
}

console.log(early.drive())

Car.prototype = {
  drive() {
    return 'replaced'
  },
}

const late = new Car('B')
console.log(early.drive(), late.drive())
console.log(early.constructor === Car, late.constructor === Car)
```

## Explanation

`new Car()` links the new object to whatever object `Car.prototype` points to **at that moment**. The link is to the object, not to the property.

1. Adding a method to the existing prototype object is visible to `early` immediately, because lookups happen at call time: `A drives`.
2. `Car.prototype = { … }` points the property at a brand-new object. `early` is still linked to the old one, so it keeps the old `drive`. `late` is linked to the new one: `A drives replaced`.
3. The old prototype had the default `constructor` property pointing to `Car`. The replacement object literal has none, so `late.constructor` walks up to `Object.prototype.constructor`, which is `Object`: `true false`.

Rule to remember: extending a prototype affects existing instances; replacing it only affects future ones (and drops `constructor` unless you add it back).
