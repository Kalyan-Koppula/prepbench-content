---
title: Two declarations, one name
difficulty: Medium
order: 5
tags: [hoisting, functions, var]
frequency: medium
expected: |
  second
  second
  third
---

```js
console.log(build())

function build() {
  return 'first'
}

var build

console.log(build())

function build() {
  return 'second'
}

build = () => 'third'
console.log(build())
```

## Explanation

Hoisting happens in a setup pass before the first line runs:

1. Both `function build` declarations are hoisted in source order, so the second one overwrites the first. `build` now returns `'second'`.
2. `var build` names a variable that already exists. A `var` with no initialiser does nothing to an existing binding, so it does not reset `build` to `undefined`.

Then execution:

- Line 1 calls the hoisted function: `second`.
- The `function build` statements and `var build` are no-ops at run time; the second call still logs `second`.
- `build = () => 'third'` is an ordinary assignment, so the last call logs `third`.

Rule to remember: the last function declaration wins at setup time, a bare `var` never clears a value, and only real assignments change it later.
