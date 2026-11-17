---
title: Function.prototype.bind
difficulty: Hard
order: 3
tags: [this, prototypes, new, closures]
frequency: high
exports: [myBind]
hints:
  - Capture the target function (`this` inside `myBind`), the bound `this` and the preset arguments in a closure, and return a new function that combines presets with call-time arguments.
  - A bound function called with `new` must ignore the bound `this`. `new.target` (or `this instanceof bound`) tells you how it was called.
  - When constructing, create the object from the target's `prototype`, run the target on it, and return the target's result instead if that result is an object.
---

Implement `myBind` so that `fn.myBind(thisArg, ...presets)` behaves like `fn.bind(thisArg, ...presets)`.

Write it as a plain function that reads the target function from `this`. The tests install it as `Function.prototype.myBind`:

```js
const counter = {
  count: 0,
  add(by, times) { this.count += by * times; return this.count },
}
const addFive = counter.add.myBind(counter, 5)
addFive(2)               // 10: `this` is counter, args are (5, 2)
setTimeout(addFive, 0, 1) // still counter

function Point(x, y) { this.x = x; this.y = y }
const AtX1 = Point.myBind(null, 1)
const p = new AtX1(2)    // Point { x: 1, y: 2 }
p instanceof Point       // true
```

**Don't use** the built-in `bind` (you may use `call`/`apply`).

## Notes

- The bound function calls the target with the bound `this`, the presets, then its own arguments, and returns the result.
- The bound `this` can't be changed later: not by calling it as a method, not by `call`/`apply`, not by binding again (re-binding only adds more presets).
- Called with `new`, the bound `this` is ignored: a new instance of the **target** is created (it inherits from `target.prototype`), presets are still applied, and if the target returns an object, that object is the result.
- Calling `myBind` on something that isn't a function throws a `TypeError`.
