---
title: Promisify
difficulty: Easy
order: 6
tags: [promises, callbacks, this]
frequency: high
exports: [promisify]
hints:
  - The wrapper returns a new Promise and calls the original function with the caller's arguments plus one extra callback at the end.
  - The callback rejects when its first argument is set and resolves with the second argument otherwise.
  - Use a regular `function` for the wrapper and call the original with `fn.call(this, ...)` so methods keep their receiver.
---

Node-style APIs take a callback as their **last** argument and call it as `callback(error, value)`. Implement `promisify(fn)`, which returns a function that takes the same arguments minus the callback and returns a promise instead.

- If the callback's `error` is truthy, the promise rejects with it.
- Otherwise it fulfils with `value`.

```js
function readConfig(name, callback) {
  setTimeout(() => {
    if (name === 'missing') callback(new Error('not found'))
    else callback(null, { name, debug: true })
  }, 10)
}

const readConfigAsync = promisify(readConfig)
const config = await readConfigAsync('app') // { name: 'app', debug: true }
```

## Notes

- The wrapper must keep `this`: `promisify(obj.method)` called as `obj.wrapped()` runs the method with `obj` as `this`.
- If `fn` throws synchronously, the promise rejects with that error.
- If the callback is called more than once, only the first call counts. Extra success values after the first are ignored.
- `fn` runs once per call of the wrapper, never when `promisify` itself is called.
