---
title: Passing values into next()
difficulty: Medium
order: 2
tags: [generators]
frequency: medium
expected: |
  name?
  hi Ada, age?
  Ada is 36 true
  true
---

```js
function* dialog() {
  const name = yield 'name?'
  const age = yield `hi ${name}, age?`
  return `${name} is ${age}`
}

const d = dialog()
console.log(d.next('ignored').value)
console.log(d.next('Ada').value)

const end = d.next(36)
console.log(end.value, end.done)
console.log(d.next().done)
```

## Explanation

The value passed to `next(x)` becomes the result of the `yield` expression the generator is **paused at**.

1. First `next('ignored')`: the generator hasn't reached any `yield` yet, so the argument has nowhere to go and is dropped. It runs to `yield 'name?'`.
2. `next('Ada')`: the paused `yield` evaluates to `'Ada'`, so `name = 'Ada'`. It runs to the second `yield`: `hi Ada, age?`.
3. `next(36)`: `age = 36`, and `return` finishes the generator with `{ value: 'Ada is 36', done: true }`.
4. A finished generator always answers `{ value: undefined, done: true }`.

Rule to remember: `next(x)` answers the *previous* `yield`, so the first `next`'s argument is always lost.
