---
title: Arrow functions as object properties
difficulty: Easy
order: 2
tags: [arrow-functions, implicit-binding]
frequency: high
expected: |
  config
  global
  config
---

```js
var kind = 'global'

const config = {
  kind: 'config',
  regular() {
    return this.kind
  },
  arrow: () => this.kind,
  nested() {
    const inner = () => this.kind
    return inner()
  },
}

console.log(config.regular())
console.log(config.arrow())
console.log(config.nested())
```

## Explanation

Arrow functions have no `this` of their own. They use the `this` of the scope they were **written** in.

1. `config.regular()` is a normal method call: `this` is `config`, so `config`.
2. `arrow` is written inside an object literal, but an object literal is not a scope. The surrounding scope is the top level of the script, where `this` is `window`. `window.kind` is the global `var`: `global`.
3. `inner` is an arrow written inside `nested`, so it borrows `nested`'s `this`, which is `config` because of the method call: `config`.

Rule to remember: an arrow's `this` comes from the enclosing *function* (or script), never from the object literal it sits in.
