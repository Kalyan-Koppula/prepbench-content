---
title: Generator throw() and return()
difficulty: Hard
order: 3
tags: [generators, errors]
frequency: low
expected: |
  caught oops
  {"value":99,"done":false}
  cleanup
  {"done":true}
  cleanup
  {"value":"bye","done":true}
  {"done":true}
---

```js
function* guarded() {
  try {
    yield 1
    yield 2
  } catch (e) {
    console.log('caught', e)
    yield 99
  } finally {
    console.log('cleanup')
  }
}

const g1 = guarded()
g1.next()
console.log(JSON.stringify(g1.throw('oops')))
console.log(JSON.stringify(g1.next()))

const g2 = guarded()
g2.next()
console.log(JSON.stringify(g2.return('bye')))
console.log(JSON.stringify(g2.next()))
```

## Explanation

**g1:** after the first `next()` it is paused at `yield 1`.
- `throw('oops')` makes that `yield` throw `'oops'` inside the generator. The `catch` handles it (`caught oops`), and the generator keeps running until `yield 99`, which becomes the result of `throw()`.
- The next `next()` leaves the `catch`, runs `finally` (`cleanup`), and finishes. The result is `{ value: undefined, done: true }`, and `JSON.stringify` drops `undefined` properties, so it prints `{"done":true}`.

**g2:** also paused at `yield 1`.
- `return('bye')` acts like a `return` statement at that `yield`. `finally` still runs (`cleanup`), then the generator finishes with `{ value: 'bye', done: true }`.
- After that it is done for good: `{"done":true}`.

Rule to remember: `throw()` and `return()` resume the generator at the paused `yield` as a throw or a return, so `try`/`catch`/`finally` behave exactly as they would there.
