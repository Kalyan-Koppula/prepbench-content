---
title: Top-level var, let and this
difficulty: Easy
order: 12
tags: [globals, default-binding]
frequency: medium
expected: |
  Earth undefined undefined
  true
  true
---

```js
var planet = 'Earth'
let moon = 'Luna'

function show() {
  console.log(this.planet, this.moon, typeof window.moon)
}

show()
console.log(window.planet === planet)
console.log(this === window)
```

## Explanation

In a classic script, the top-level scope has two parts: the global object (`window`) and a separate declarative record for `let`, `const` and `class`.

1. `show()` is a plain call in sloppy mode, so `this` is `window`.
2. `var planet` becomes a property of `window`, so `this.planet` is `Earth`.
3. `let moon` is global but **not** a property of `window`, so `this.moon` is `undefined` and `typeof window.moon` is `'undefined'`.
4. `window.planet === planet` is `true`: same storage.
5. At the top level of a classic script, `this` is the global object itself: `true`. (In an ES module it would be `undefined`.)

Rule to remember: top-level `var` and function declarations attach to `window`; `let`/`const`/`class` don't.
