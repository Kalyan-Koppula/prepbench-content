---
title: this in static methods
difficulty: Hard
order: 15
tags: [classes, static, lost-this]
frequency: low
expected: |
  User
  true
  TypeError
---

```js
class Model {
  static create() {
    return new this()
  }
  static describe() {
    return this.name
  }
}

class User extends Model {}

console.log(User.describe())
console.log(User.create() instanceof User)

const make = User.create
try {
  make()
} catch (e) {
  console.log(e.name)
}
```

## Explanation

Static methods are ordinary methods on the class (constructor) object, so implicit binding applies to them like any other method.

1. `User.describe()` finds `describe` on `Model` through the chain `User → Model`, but `this` is the receiver, `User`. Its `name` is `User`.
2. `User.create()` runs `new this()` with `this = User`, so it builds a `User`: `true`. This is why factories use `this` rather than hard-coding the class name.
3. `make()` detaches the method. Class bodies are strict, so `this` is `undefined`, and `new undefined()` throws a `TypeError`.

Rule to remember: inside a static method `this` is whichever class it was called on, and detaching it loses that like any method.
