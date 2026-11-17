---
title: await on a plain value still pauses
difficulty: Easy
order: 1
tags: [async-await, microtasks]
frequency: high
expected: |
  before
  load start
  after
  load end
---

```js
async function load() {
  console.log('load start')
  await null
  console.log('load end')
}

console.log('before')
load()
console.log('after')
```

## Explanation

1. `before` logs.
2. Calling `load()` runs its body **synchronously** up to the first `await`: `load start`.
3. `await null` wraps `null` in a resolved promise and pauses the function. The rest of the body is queued as a microtask, and `load()` returns a pending promise to the caller.
4. `after` logs; the script ends.
5. The microtask resumes `load`: `load end`.

Rule to remember: `await` always pauses, even on a non-promise. Everything after it runs later as a microtask.
