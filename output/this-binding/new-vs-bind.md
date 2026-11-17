---
title: new on a bound constructor
difficulty: Hard
order: 7
tags: [new-binding, call-apply-bind]
frequency: medium
expected: |
  1 2
  0 0
  true
  true
---

```js
function Point(x, y) {
  this.x = x
  this.y = y
}

const target = { x: 0, y: 0 }
const PointAtOne = Point.bind(target, 1)

const p = new PointAtOne(2)

console.log(p.x, p.y)
console.log(target.x, target.y)
console.log(p instanceof Point)
console.log(p instanceof PointAtOne)
```

## Explanation

`new` has the highest precedence of the binding rules, higher even than `bind`.

1. `new PointAtOne(2)` constructs with the **original** `Point`. A fresh object becomes `this`; the bound `target` is ignored. The pre-filled argument is kept, so the call is effectively `new Point(1, 2)`: `1 2`.
2. `target` was never written to: `0 0`.
3. The new object's prototype is `Point.prototype`, so `p instanceof Point` is `true`.
4. A bound function has no `prototype` of its own; `instanceof` with a bound function on the right checks against its target, `Point`. Also `true`.

Rule to remember: `new` beats `bind` for `this`, but bound arguments still apply.
