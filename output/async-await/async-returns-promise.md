---
title: What an async function returns
difficulty: Easy
order: 2
tags: [async-await, promises]
frequency: high
expected: |
  object true
  false
  end
  value 42
---

```js
async function getNumber() {
  return 42
}

const result = getNumber()
console.log(typeof result, result instanceof Promise)
console.log(result === 42)

result.then((v) => console.log('value', v))
console.log('end')
```

## Explanation

1. An `async` function **always** returns a promise. `return 42` fulfils that promise with `42`; it doesn't hand `42` to the caller. So `typeof result` is `'object'` and it is a `Promise`.
2. `result === 42` is `false`.
3. The `then` handler is queued (the promise is already fulfilled), and `end` logs first.
4. Microtask: `value 42`.

Rule to remember: to get the value out of an async function, `await` it or use `.then`.
