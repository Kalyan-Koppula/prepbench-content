---
title: super in constructors and methods
difficulty: Easy
order: 8
tags: [classes, inheritance, super]
frequency: high
expected: |
  shape square of side 3
  ReferenceError
---

```js
class Shape {
  constructor(label) { this.label = label }
  describe() {
    return 'shape ' + this.label
  }
}

class Square extends Shape {
  constructor(side) {
    super('square')
    this.side = side
  }
  describe() {
    return super.describe() + ' of side ' + this.side
  }
}

class Broken extends Shape {
  constructor() {
    this.ready = true // before super()
    super('broken')
  }
}

console.log(new Square(3).describe())
try { new Broken() } catch (e) { console.log(e.name) }
```

## Explanation

1. `new Square(3)`: `super('square')` runs `Shape`'s constructor on the new object, setting `label`; then `side` is set.
2. `super.describe()` calls the parent's method with the same `this`, so it reads `this.label` from the square: `shape square`, then the override appends ` of side 3`.
3. In a derived class, `this` doesn't exist until `super()` returns, because the parent constructor is what creates the object. `Broken` touches `this` first, which throws a `ReferenceError`.

Rule to remember: in a subclass constructor, call `super()` before using `this`; `super.method()` reuses the parent's logic with the current `this`.
