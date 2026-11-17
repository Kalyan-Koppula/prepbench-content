---
title: Promise.all over an async map
difficulty: Medium
order: 12
tags: [async-await, promise-all, timers]
frequency: medium
expected: |
  start 3
  start 1
  start 2
  main called
  end 1
  end 2
  end 3
  [6,2,4]
---

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function handle(n) {
  console.log('start', n)
  await wait(n * 10)
  console.log('end', n)
  return n * 2
}

async function main() {
  const out = await Promise.all([3, 1, 2].map(handle))
  console.log(JSON.stringify(out))
}

main()
console.log('main called')
```

## Explanation

1. `map` calls `handle` for each element right away. Each call runs synchronously to its `await`: `start 3`, `start 1`, `start 2`, starting timers of 30, 10 and 20 ms. `map` returns three pending promises.
2. `main` awaits `Promise.all(...)` and pauses: `main called`.
3. The timers finish shortest first: `end 1`, `end 2`, `end 3`.
4. `Promise.all` fulfils with the results in **input** order (3, 1, 2 doubled): `[6,2,4]`.

Rule to remember: `arr.map(asyncFn)` starts all the work at once; `Promise.all` waits for it and keeps the original order.
