---
title: var and let inside an if block
difficulty: Easy
order: 11
tags: [block-scope, var, let-const]
frequency: high
expected: |
  dark red
  dark blue
---

```js
var mode = 'light'
let theme = 'blue'

if (true) {
  var mode = 'dark'
  let theme = 'red'
  console.log(mode, theme)
}

console.log(mode, theme)
```

## Explanation

1. `var` ignores blocks. The `var mode` inside the `if` is the same global `mode`, so `= 'dark'` overwrites it.
2. `let theme` inside the braces creates a new block-scoped variable that shadows the outer `theme` only inside the block.
3. Inside the block: `dark red`.
4. After the block, the inner `theme` is gone and the outer one was never changed: `dark blue`. `mode` stays `dark`.

Rule to remember: `let`/`const` belong to the nearest `{}`; `var` belongs to the nearest function.
