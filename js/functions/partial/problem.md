---
title: Partial application
difficulty: Medium
order: 10
tags: [closures, higher-order functions, this]
frequency: low
exports: [partial]
hints:
  - The returned function builds a new argument list on every call; never write into the preset array.
  - Walk the presets, swapping each placeholder for the next call argument, then append whatever call arguments are left.
  - Call `fn` with `apply` so the returned function's `this` reaches it.
---

Implement `partial(fn, ...presets)`. It returns a function that calls `fn` with the preset arguments followed by the arguments it is called with.

Support a placeholder, `partial.placeholder` (define it on `partial`), that reserves a preset position for a call argument:

```js
const _ = partial.placeholder
const greet = (greeting, name, mark) => `${greeting}, ${name}${mark}`

const hello = partial(greet, 'Hello')
hello('Ada', '!')          // "Hello, Ada!"

const toAda = partial(greet, _, 'Ada')
toAda('Hi', '?')           // "Hi, Ada?"
```

## Notes

- Call arguments fill placeholders from left to right; leftover call arguments are appended.
- Placeholders that receive no call argument become `undefined`.
- Unlike `curry`, the returned function always calls `fn` right away, whatever the number of arguments.
- `fn` gets the `this` of the returned function's call; return `fn`'s result.
- The partially applied function is reusable: calling it never changes its presets.
