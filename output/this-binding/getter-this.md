---
title: this in a getter
difficulty: Medium
order: 11
tags: [getters, prototypes]
frequency: medium
expected: |
  Grace Lovelace
  X Y
  Grace Lovelace
---

```js
const base = {
  first: 'Ada',
  last: 'Lovelace',
  get full() {
    return `${this.first} ${this.last}`
  },
}

const child = Object.create(base)
child.first = 'Grace'

console.log(child.full)

const desc = Object.getOwnPropertyDescriptor(base, 'full')
console.log(desc.get.call({ first: 'X', last: 'Y' }))

const { full } = child
console.log(full)
```

## Explanation

A getter is a function, and its `this` is the object the property was read **from** (the receiver), even when the getter is found further up the prototype chain.

1. `child.full`: the getter lives on `base`, but it is called with `this = child`. `child.first` is its own `Grace`; `last` comes from `base`: `Grace Lovelace`.
2. The descriptor exposes the raw getter function. Calling it with `call` sets `this` to any object: `X Y`.
3. Destructuring `const { full } = child` reads `child.full` once, running the getter with `this = child`, and stores the resulting **string**. Unlike extracting a method, nothing is lost: `Grace Lovelace`.

Rule to remember: getters run with the receiver as `this`, and destructuring a getter copies its value, not the function.
