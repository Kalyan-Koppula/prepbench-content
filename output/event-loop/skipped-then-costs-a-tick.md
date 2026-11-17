---
title: Skipped handlers still take a tick
difficulty: Hard
order: 19
tags: [promises, errors, microtasks]
frequency: low
expected: |
  then 1 1
  other 1
  other 2
  caught boom
  other 3
  then 3 recovered
  other 4
---

```js
Promise.resolve(1)
  .then((v) => {
    console.log('then 1', v)
    throw new Error('boom')
  })
  .then(() => console.log('then 2'))
  .catch((e) => {
    console.log('caught', e.message)
    return 'recovered'
  })
  .then((v) => console.log('then 3', v))

Promise.resolve()
  .then(() => console.log('other 1'))
  .then(() => console.log('other 2'))
  .then(() => console.log('other 3'))
  .then(() => console.log('other 4'))
```

## Explanation

Each chain advances one step per microtask round, and the rounds alternate between chain A (top) and chain B (bottom).

| Round | Chain A | Chain B |
|---|---|---|
| 1 | `then 1 1`, throws | `other 1` |
| 2 | `then 2` is skipped, but passing the rejection through it is still a job | `other 2` |
| 3 | `caught boom`, returns `'recovered'` | `other 3` |
| 4 | `then 3 recovered` | `other 4` |

The trap is round 2. A `then` with no rejection handler doesn't vanish from the chain. Its promise still has to be rejected in its own microtask, so the `catch` runs one round later than you might expect.

Rule to remember: every link in a chain costs one microtask, whether its handler runs or the value just passes through.
