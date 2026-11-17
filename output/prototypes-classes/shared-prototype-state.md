---
title: Mutable data on the prototype
difficulty: Easy
order: 2
tags: [prototype-chain, constructors]
frequency: high
expected: |
  1 0
  false true
---

```js
function Basket() {}
Basket.prototype.items = []
Basket.prototype.count = 0

const a = new Basket()
const b = new Basket()

a.items.push('apple')
a.count++

console.log(b.items.length, b.count)
console.log(a.hasOwnProperty('items'), a.hasOwnProperty('count'))
```

## Explanation

1. `a.items.push(…)` **reads** `a.items`, which isn't own, so it finds the single array on `Basket.prototype` and mutates it. Every instance shares that array, so `b.items.length` is `1`.
2. `a.count++` is `a.count = a.count + 1`. The read finds `0` on the prototype; the **write** creates an own `count` of `1` on `a`. `b` still reads the prototype's `0`.
3. So `a` has an own `count` but no own `items`: `false true`.

This is why per-instance data goes in the constructor (`this.items = []`) and only methods go on the prototype.

Rule to remember: mutating an object found on the prototype affects every instance; assigning creates an own property.
