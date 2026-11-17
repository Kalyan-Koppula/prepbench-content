---
title: Generators are lazy
difficulty: Easy
order: 1
tags: [generators]
frequency: high
expected: |
  created
  gen start
  1
  after 1
  2
  gen end
  undefined true
---

```js
function* count() {
  console.log('gen start')
  yield 1
  console.log('after 1')
  yield 2
  console.log('gen end')
}

const it = count()
console.log('created')

console.log(it.next().value)
console.log(it.next().value)

const last = it.next()
console.log(last.value, last.done)
```

## Explanation

1. Calling `count()` runs **none** of its body. It just returns a generator object, so `created` is the first log.
2. The first `next()` runs from the top to the first `yield`: `gen start`, then the yielded `1` is logged.
3. The second `next()` resumes after `yield 1`: `after 1`, then `2`.
4. The third `next()` resumes, logs `gen end`, and falls off the end. The result is `{ value: undefined, done: true }`, since there's no `return` value.

Rule to remember: a generator body runs only inside `next()`, one `yield` at a time.
