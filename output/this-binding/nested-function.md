---
title: A helper function inside a method
difficulty: Easy
order: 9
tags: [default-binding, nested-functions]
frequency: medium
expected: |
  window total | 100 | 100
---

```js
var total = 'window total'

const invoice = {
  total: 100,
  summary() {
    function helper() {
      return this.total
    }
    const self = this
    function viaSelf() {
      return self.total
    }
    return [helper(), viaSelf(), helper.call(this)].join(' | ')
  },
}

console.log(invoice.summary())
```

## Explanation

Inside `summary`, `this` is `invoice`. But every regular function gets its own `this`, decided by its own call.

1. `helper()` is a plain call, so default binding gives it `window`, not `invoice`: `window total`.
2. `viaSelf` doesn't use `this` at all. It reads `self`, an ordinary variable captured by closure, which holds `invoice`: `100`. (This `const self = this` trick is the pre-arrow fix.)
3. `helper.call(this)` passes `summary`'s `this` explicitly: `100`.

Rule to remember: `this` is not inherited by nested regular functions; capture it in a variable, use an arrow, or pass it with `call`.
