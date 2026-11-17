---
title: Debounce
difficulty: Medium
order: 1
tags: [timers, closures, this]
frequency: high
exports: [debounce]
hints:
  - Each call should cancel the timer left by the previous call and start a new one.
  - Keep the timer id in a closure shared by every call of the returned function.
  - Capture `this` and the arguments of the latest call, and apply them when the timer fires.
---

Implement `debounce(fn, wait)`. It returns a new function that delays calling `fn` until `wait` milliseconds have passed since the **last** time the returned function was called.

When `fn` finally runs it must receive the arguments of the most recent call, with `this` bound the way the debounced function was called.

```js
const save = debounce((text) => console.log('saved', text), 300)
save('h')
save('he')
save('hey') // 300ms after this call: logs "saved hey" once
```

Add a `cancel()` method to the returned function that drops any pending call.

## Notes

- `wait` may be `0`; the call still happens asynchronously.
- You don't need to return `fn`'s result.
