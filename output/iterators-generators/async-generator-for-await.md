---
title: Async generators with for await
difficulty: Hard
order: 8
tags: [async-generators, async-await, timers]
frequency: medium
expected: |
  main started
  produce 1
  consume 1
  timer 45
  produce 2
  consume 2
  ticker closed
  done
---

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function* ticker() {
  try {
    for (let i = 1; i <= 3; i++) {
      await wait(30)
      console.log('produce', i)
      yield i
    }
  } finally {
    console.log('ticker closed')
  }
}

async function main() {
  for await (const n of ticker()) {
    console.log('consume', n)
    if (n === 2) break
  }
  console.log('done')
}

main()
setTimeout(() => console.log('timer 45'), 45)
console.log('main started')
```

## Explanation

1. `main()` starts the loop, which calls `next()` on the generator. The generator body runs until `await wait(30)` and pauses. `main` is now waiting too. The 45 ms timer is set and `main started` logs.
2. **~30 ms:** `produce 1`. The `yield` fulfils the pending `next()` promise, `main` resumes and logs `consume 1`, then asks for the next value. The generator starts *another* 30 ms wait. It is lazy: it only produces when asked.
3. **~45 ms:** the independent timer fires: `timer 45`.
4. **~60 ms:** `produce 2`, `consume 2`. Then `break`.
5. `break` calls the generator's `return()`, which runs its `finally` (`ticker closed`). `for await` awaits that cleanup before continuing, so `done` comes last. `produce 3` never happens.

Rule to remember: `for await` pulls one value at a time and waits for each; breaking out awaits the generator's cleanup.
