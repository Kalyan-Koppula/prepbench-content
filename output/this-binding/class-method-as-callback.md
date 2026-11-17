---
title: Passing a class method to map
difficulty: Medium
order: 4
tags: [classes, callbacks, lost-this]
frequency: high
expected: |
  TypeError
  #a #b
  #a #b
---

```js
class Cart {
  constructor() {
    this.items = ['a', 'b']
    this.prefix = '#'
  }
  format(item) {
    return this.prefix + item
  }
}

const cart = new Cart()

try {
  console.log(cart.items.map(cart.format).join(' '))
} catch (e) {
  console.log(e.name)
}

console.log(cart.items.map(cart.format, cart).join(' '))
console.log(cart.items.map((i) => cart.format(i)).join(' '))
```

## Explanation

1. `cart.items.map(cart.format)` hands `map` the bare function. `map` calls it without a receiver. Class bodies are always strict, so `this` is `undefined`, and `undefined.prefix` throws a `TypeError`.
2. `map` (like `forEach`, `filter`, …) accepts a second argument, `thisArg`, which it uses as `this` for each call. With `cart` passed, it logs `#a #b`.
3. The arrow wrapper calls `cart.format(i)` as a method call, so implicit binding applies again: `#a #b`.

`cart.format.bind(cart)` would work too.

Rule to remember: passing `obj.method` passes only the function; keep the object with an arrow, `bind`, or the callback's `thisArg`.
