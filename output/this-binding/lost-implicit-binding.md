---
title: Parentheses, comma and assignment
difficulty: Hard
order: 13
tags: [implicit-binding, default-binding]
frequency: low
expected: |
  obj
  obj
  global
  global
  undefined
---

```js
var source = 'global'

const obj = {
  source: 'obj',
  read() {
    return this.source
  },
}

console.log(obj.read())
console.log((obj.read)())
console.log((obj.read = obj.read)())
console.log((0, obj.read)())
console.log([obj.read][0]())
```

## Explanation

A method call keeps its receiver only when the thing being called is a **property reference** (`obj.read`), not a plain value.

1. `obj.read()`: ordinary method call, `obj`.
2. `(obj.read)()`: grouping parentheses don't evaluate the reference away, so it's still a method call: `obj`.
3. `(obj.read = obj.read)()`: an assignment expression produces the **value** (the bare function). Called with no receiver, sloppy mode uses `window`: `global`.
4. `(0, obj.read)()`: the comma operator also returns a bare value: `global`. Bundlers emit this pattern on purpose to call imports without a receiver.
5. `[obj.read][0]()`: this *is* a property reference, but on the array. `this` is the array, which has no `source`: `undefined`.

Rule to remember: `this` is the object in the property access immediately before the call; any expression that returns the function as a value drops it.
