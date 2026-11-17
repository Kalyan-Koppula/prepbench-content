---
title: Overriding only the setter
difficulty: Hard
order: 10
tags: [classes, getters, inheritance]
frequency: low
expected: |
  D:undefinedC
  D:undefinedC 10
---

```js
class Temp {
  _c = 20
  get c() { return this._c }
  set c(x) { this._c = x }
  get label() {
    return this.c + 'C'
  }
}

class Doubled extends Temp {
  set c(x) {
    super.c = x * 2
  }
  get label() {
    return 'D:' + super.label
  }
}

const t = new Doubled()
console.log(t.label)
t.c = 5
console.log(t.label, t._c)
```

## Explanation

A getter and a setter with the same name form **one** property. Defining just `set c` in `Doubled` creates an accessor whose getter is `undefined`, and it shadows `Temp`'s whole `c` (getter included).

1. `t.label` runs `Doubled`'s getter, which calls `super.label`: `Temp`'s getter with `this = t`.
2. That reads `this.c`. Lookup finds `c` on `Doubled.prototype` first, an accessor with no getter, so the read gives `undefined`. It never reaches `Temp`'s getter. Result: `D:undefinedC`.
3. `t.c = 5` runs `Doubled`'s setter. `super.c = 10` calls `Temp`'s setter with `this = t`, so `_c` becomes `10`.
4. Reading `c` is still broken: `D:undefinedC 10`.

Rule to remember: override getters and setters in pairs; a lone setter hides the inherited getter.
