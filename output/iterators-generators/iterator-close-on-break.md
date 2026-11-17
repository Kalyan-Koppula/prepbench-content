---
title: Breaking out calls return()
difficulty: Medium
order: 7
tags: [iterators, generators, destructuring]
frequency: low
expected: |
  got 1
  got 2
  numbers closed
  return called at 2
  1 2
---

```js
function* numbers() {
  try {
    yield 1
    yield 2
    yield 3
  } finally {
    console.log('numbers closed')
  }
}

for (const n of numbers()) {
  console.log('got', n)
  if (n === 2) break
}

const counter = {
  i: 0,
  [Symbol.iterator]() { return this },
  next() { return { value: ++this.i, done: this.i > 5 } },
  return() {
    console.log('return called at', this.i)
    return { done: true }
  },
}

const [a, b] = counter
console.log(a, b)
```

## Explanation

**`for...of` with `break`:** the loop stops early, so it calls the iterator's `return()` method to let it clean up. For a generator, `return()` resumes at the paused `yield 2` as if it were a `return` statement, so the `finally` block runs: `numbers closed`. `yield 3` never runs.

**Destructuring:** `const [a, b] = counter` pulls exactly two values. The iterator isn't done, so destructuring also closes it by calling `return()`: `return called at 2`. Then `1 2` logs.

The same happens with `throw` inside the loop, or `return` from the function that contains it.

Rule to remember: any consumer that stops before `done: true` calls `iterator.return()`. That's how generators get their `finally` blocks run.
