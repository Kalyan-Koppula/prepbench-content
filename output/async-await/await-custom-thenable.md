---
title: Awaiting a thenable object
difficulty: Medium
order: 7
tags: [async-await, thenables]
frequency: low
expected: |
  before await
  sync end
  then called
  from thenable
---

```js
const thenable = {
  then(resolve) {
    console.log('then called')
    resolve('from thenable')
  },
}

async function main() {
  console.log('before await')
  const v = await thenable
  console.log(v)
}

main()
console.log('sync end')
```

## Explanation

1. `main()` runs synchronously: `before await`.
2. `await thenable`: the object has a `then` method, so `await` treats it like a promise. It doesn't call `then` right away; it queues a job that will call `thenable.then(resolve, reject)`. `main` pauses.
3. `sync end` logs.
4. Microtask: the job calls `then`, which logs `then called` and calls `resolve('from thenable')`. That queues `main`'s continuation.
5. `main` resumes with `v = 'from thenable'`.

Rule to remember: `await` (like `Promise.resolve`) accepts any object with a `then` method and calls it asynchronously.
