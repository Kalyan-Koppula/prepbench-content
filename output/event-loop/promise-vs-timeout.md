---
title: Promise callbacks vs setTimeout
difficulty: Easy
order: 1
tags: [microtasks, timers]
frequency: high
expected: |
  1
  4
  3
  2
---

```js
console.log(1)

setTimeout(() => console.log(2), 0)

Promise.resolve().then(() => console.log(3))

console.log(4)
```

## Explanation

The synchronous lines run first, so `1` and `4` print immediately.

When the script finishes, the event loop drains the **microtask** queue before it picks the next **task**. The `then` callback is a microtask, so `3` prints next. The `setTimeout` callback is a task, even with a delay of `0`, so `2` prints last.

Rule to remember: sync code, then every microtask, then one task, then microtasks again.
