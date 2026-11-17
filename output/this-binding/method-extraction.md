---
title: Pulling a method off its object
difficulty: Easy
order: 1
tags: [implicit-binding, default-binding]
frequency: high
expected: |
  widget
  window
---

```js
var label = 'window'

const widget = {
  label: 'widget',
  getLabel() {
    return this.label
  },
}

const getLabel = widget.getLabel

console.log(widget.getLabel())
console.log(getLabel())
```

## Explanation

`this` is decided by how a function is **called**, not where it lives.

1. `widget.getLabel()` is a method call: the object before the dot becomes `this` (**implicit binding**), so it logs `widget`.
2. `const getLabel = widget.getLabel` copies a reference to the same function. The object is not attached to it.
3. `getLabel()` is a plain call, so **default binding** applies: in sloppy mode `this` is the global object. A top-level `var label` is a property of `window`, so it logs `window`.

Rule to remember: no dot (or call/apply/bind) at the call site means no object; the method forgets where it came from.
