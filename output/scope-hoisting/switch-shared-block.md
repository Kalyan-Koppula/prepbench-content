---
title: let inside a switch case
difficulty: Hard
order: 12
tags: [block-scope, tdz, switch]
frequency: low
expected: |
  alpha
  ReferenceError
---

```js
function label(kind) {
  switch (kind) {
    case 'a':
      let text = 'alpha'
      return text
    case 'b':
      text = 'beta'
      return text
  }
}

console.log(label('a'))

try {
  console.log(label('b'))
} catch (e) {
  console.log(e.name)
}
```

## Explanation

The cases of a `switch` are not separate blocks. The whole `{ … }` after `switch (kind)` is **one** block, so `let text` is visible to every case.

1. `label('a')` runs the declaration, then returns `alpha`.
2. `label('b')` starts a new call with a fresh block. It jumps straight to `case 'b'`, skipping `let text = 'alpha'`. The binding exists (it was hoisted to the top of the block) but its declaration never ran, so it is still in the temporal dead zone.
3. Assigning to a TDZ binding throws, so the catch logs `ReferenceError`.

The fix is to wrap each case body in its own braces: `case 'a': { let text = … }`.

Rule to remember: a `switch` body is a single block; give each case its own `{}` when it declares `let`/`const`.
