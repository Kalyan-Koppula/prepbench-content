---
title: Returning a value from a constructor
difficulty: Medium
order: 11
tags: [constructors, new]
frequency: medium
expected: |
  plain
  other false
  nulled
---

```js
function Plain() {
  this.kind = 'plain'
  return 42
}

function Swap() {
  this.kind = 'swap'
  return { kind: 'other' }
}

class Nulled {
  constructor() {
    this.kind = 'nulled'
    return null
  }
}

console.log(new Plain().kind)
console.log(new Swap().kind, new Swap() instanceof Swap)
console.log(new Nulled().kind)
```

## Explanation

`new` creates an object, links it to the prototype, runs the constructor with it as `this`, and then looks at the return value:

- If the constructor returns an **object**, that object replaces the one `new` created.
- Otherwise (a primitive, `null`, or nothing), `new` returns its own object.

1. `Plain` returns `42`, a primitive, so it is ignored: `plain`.
2. `Swap` returns an object literal, which wins. It wasn't built from `Swap.prototype`, so `instanceof` is `false`: `other false`.
3. `null` is not an object for this rule (despite `typeof null`), so `Nulled` returns its own instance: `nulled`.

Rule to remember: only returning an object overrides `new`; primitives and `null` are ignored.
