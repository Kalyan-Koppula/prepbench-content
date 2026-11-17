---
title: async callbacks in forEach vs for...of
difficulty: Medium
order: 9
tags: [async-await, loops, timers]
frequency: high
expected: |
  after forEach
  forEach 10
  forEach 20
  forEach 30
  for-of 30
  for-of 10
  after for-of
---

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function run() {
  ;[30, 10, 20].forEach(async (ms) => {
    await wait(ms)
    console.log('forEach', ms)
  })
  console.log('after forEach')

  for (const ms of [30, 10]) {
    await wait(ms)
    console.log('for-of', ms)
  }
  console.log('after for-of')
}

run()
```

## Explanation

**`forEach`:** it calls the async callback three times and ignores the promises they return. All three timers (30, 10, 20 ms) start immediately and `forEach` returns at once, so `after forEach` logs first. The callbacks then finish in **timer order**: 10, 20, 30.

**`for...of`:** the `await` is in `run` itself, so the loop really pauses. Its first 30 ms timer was created right after the `forEach` timers, so at ~30 ms `forEach 30` logs, then `for-of 30`. Only then does the 10 ms wait start: `for-of 10` at ~40 ms, then `after for-of`.

Rule to remember: `forEach` never waits for an async callback. Use `for...of` with `await` for sequential work, or `Promise.all(arr.map(...))` for parallel work.
