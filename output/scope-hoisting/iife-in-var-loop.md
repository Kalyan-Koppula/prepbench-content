---
title: An IIFE that fixes half the loop
difficulty: Medium
order: 10
tags: [iife, closures, loops]
frequency: medium
expected: |
  3 4 5
---

```js
var logs = []

for (var i = 0; i < 3; i++) {
  ;(function (n) {
    logs.push(() => n + i)
  })(i)
}

console.log(logs.map((f) => f()).join(' '))
```

## Explanation

This is the pre-`let` fix for loop closures, applied to only one of the two variables.

1. Each iteration calls the IIFE with the current `i`. The parameter `n` is a new variable in a new function scope, so it holds a snapshot: `0`, `1`, `2`.
2. The arrow also reads `i`, and that is still the single global `var i`. Nothing copied it.
3. When the arrows run, the loop has finished and `i` is `3`. The sums are `0+3`, `1+3`, `2+3`.

Output: `3 4 5`.

Rule to remember: passing a value into a function freezes that value in a new variable; anything the closure reads directly from outside is still shared.
