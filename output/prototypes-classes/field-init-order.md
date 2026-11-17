---
title: Base constructor calls an overridden method
difficulty: Hard
order: 6
tags: [classes, class-fields, inheritance]
frequency: low
expected: |
  Base sees base child describe base
  child
---

```js
class Base {
  name = 'base'
  constructor() {
    console.log('Base sees', this.name, this.describe())
  }
  describe() {
    return 'base describe'
  }
}

class Child extends Base {
  name = 'child'
  describe() {
    return 'child describe ' + this.name
  }
}

const c = new Child()
console.log(c.name)
```

## Explanation

`new Child()` runs in this order: `Child`'s implicit constructor calls `super()`, which runs `Base`'s field initialisers and constructor body; only after `super()` returns are `Child`'s fields initialised.

1. Inside `Base`'s constructor, `Base`'s field has run, so `this.name` is `'base'`.
2. `this.describe()` is looked up on the instance's chain, whose first prototype is `Child.prototype`, so the **overridden** method runs. Methods exist on the prototype from the start; it reads `this.name`, which is still `'base'`. The log is `Base sees base child describe base`.
3. After `super()` returns, `Child`'s field sets `name` to `'child'`.

Rule to remember: subclass fields don't exist yet while the base constructor runs, but subclass methods already do.
