---
title: Two async loops sharing the clock
difficulty: Medium
order: 10
tags: [async-await, loops, timers]
frequency: medium
expected: |
  started
  A 1
  B 1
  A 2
  B 2
  timer 75
  A 3
  B 3
---

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function tick(label) {
  for (let i = 1; i <= 3; i++) {
    await sleep(30)
    console.log(label, i)
  }
}

tick('A')
tick('B')
setTimeout(() => console.log('timer 75'), 75)
console.log('started')
```

## Explanation

1. `tick('A')` runs until its first `await`, starting a 30 ms timer. `tick('B')` does the same. Then the 75 ms timer is set and `started` logs.
2. Each loop wakes, logs, and starts its **next** 30 ms sleep, so the loops wake up at ~30, ~60 and ~90 ms.
3. At each wake-up A goes first, because A's timer was always created just before B's.
4. The independent 75 ms timer falls between the second (~60 ms) and third (~90 ms) iterations.

Rule to remember: an `await` inside a loop pauses only that function. Other async functions and timers keep running around it.
