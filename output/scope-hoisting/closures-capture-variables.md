---
title: Closures capture variables, not values
difficulty: Medium
order: 16
tags: [closures]
frequency: high
expected: |
  second
  second third
---

```js
let message = 'first'
const show = () => message

message = 'second'
console.log(show())

function snapshot(value) {
  return () => value
}

const saved = snapshot(message)
message = 'third'
console.log(saved(), show())
```

## Explanation

1. `show` closes over the variable `message` itself. It reads it each time it is called, so after the reassignment it logs `second`.
2. `snapshot(message)` passes the current **value** (`'second'`) as an argument. Inside, `value` is a new variable that nothing else writes to, and the returned arrow closes over that.
3. `message = 'third'` changes the outer variable. `saved()` still reads its own `value` (`second`); `show()` reads the live `message` (`third`).

Rule to remember: a closure keeps a live link to the variable; copy into a parameter or a fresh `const` when you want a snapshot.
