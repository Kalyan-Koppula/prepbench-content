---
title: Closures created in a var loop
difficulty: Medium
order: 6
tags: [closures, var, loops]
frequency: high
expected: |
  30 30 30
  3
---

```js
var handlers = []

for (var i = 0; i < 3; i++) {
  handlers.push(() => i * 10)
}

console.log(handlers[0](), handlers[1](), handlers[2]())
console.log(i)
```

## Explanation

`var` is function-scoped (here, global), so the loop has **one** `i` shared by every iteration.

1. Each iteration pushes an arrow that reads `i` when it is *called*, not when it is created. All three closures point at the same variable.
2. The loop stops when `i` becomes `3`.
3. Calling the handlers afterwards reads the current `i`: `3 * 10` three times, so `30 30 30`.
4. `i` also leaked out of the loop, so the last line prints `3`.

Swapping `var` for `let` gives each iteration its own binding and prints `0 10 20`.

Rule to remember: closures capture the variable, and a `var` loop only has one.
