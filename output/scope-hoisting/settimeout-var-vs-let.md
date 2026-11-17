---
title: Timers in var and let loops
difficulty: Easy
order: 8
tags: [closures, loops, timers]
frequency: high
expected: |
  var 3
  var 3
  var 3
  let 0
  let 1
  let 2
---

```js
for (var a = 0; a < 3; a++) {
  setTimeout(() => console.log('var', a), 0)
}

for (let b = 0; b < 3; b++) {
  setTimeout(() => console.log('let', b), 0)
}
```

## Explanation

Both loops finish completely before any timer fires; the six callbacks then run in the order they were scheduled.

1. The `var` loop has a single `a`. By the time the first three callbacks run, it is `3`, so each logs `var 3`.
2. The `let` loop creates a new `b` per iteration, and each callback closes over its own: `let 0`, `let 1`, `let 2`.

Rule to remember: delayed callbacks read variables when they run; `let` in the loop header is what gives each one its own copy.
