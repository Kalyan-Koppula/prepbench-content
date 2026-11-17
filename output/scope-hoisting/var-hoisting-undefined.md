---
title: Reading a var before its line
difficulty: Easy
order: 1
tags: [hoisting, var]
frequency: high
expected: |
  undefined
  10
  undefined
---

```js
console.log(total)
var total = 10
console.log(total)

function report() {
  console.log(label)
  var label = 'inner'
}

report()
```

## Explanation

Before any line of a scope runs, the engine creates every `var` declared in it and sets it to `undefined`. Only the **declaration** is hoisted; the `= 10` assignment stays where it is written.

1. Line 1 reads the global `total`, which already exists with the value `undefined`.
2. `var total = 10` assigns, so the next log prints `10`.
3. `report()` gets a fresh function scope. Its own `var label` is hoisted to the top of that function, so the log inside reads `undefined` instead of throwing.

Rule to remember: `var` is hoisted as `undefined` to the top of its function (or the script); the value arrives only when the assignment line runs.
