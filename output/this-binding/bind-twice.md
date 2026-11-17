---
title: Binding a bound function
difficulty: Medium
order: 6
tags: [call-apply-bind]
frequency: high
expected: |
  first
  bound bound whoAmI
  first
---

```js
function whoAmI() {
  return this.tag
}

const first = whoAmI.bind({ tag: 'first' })
const second = first.bind({ tag: 'second' })

console.log(second())
console.log(second.name)
console.log(second.call({ tag: 'third' }))
```

## Explanation

A bound function is a wrapper that always calls its target with the stored `this`.

1. `first` calls `whoAmI` with `{ tag: 'first' }`.
2. `second` is a wrapper around `first`, storing `{ tag: 'second' }`. When called, it calls `first` with that `this`, but `first` ignores the `this` it receives and calls `whoAmI` with its own stored object. Result: `first`.
3. Each `bind` prefixes the name with `"bound "`, so the name is `bound bound whoAmI`, which shows the two layers of wrapping.
4. `call` on `second` is ignored for the same reason: `first`.

Rule to remember: the first `bind` wins; rebinding only adds wrappers (and pre-filled arguments still accumulate).
