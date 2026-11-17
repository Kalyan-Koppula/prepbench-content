---
title: A rejected promise awaited later
difficulty: Medium
order: 11
tags: [async-await, errors]
frequency: low
expected: |
  fail runs
  promise created
  doing other work
  caught late
---

```js
async function fail() {
  console.log('fail runs')
  throw new Error('late')
}

async function main() {
  const p = fail()
  console.log('promise created')

  await null
  console.log('doing other work')

  try {
    await p
  } catch (e) {
    console.log('caught', e.message)
  }
}

main()
```

## Explanation

1. Calling `fail()` runs its body right away: `fail runs`. The throw rejects `p`; nothing is thrown at the call site, so execution continues: `promise created`.
2. `await null` pauses `main` for one microtask. `p` is rejected with no handler yet.
3. `main` resumes: `doing other work`.
4. `await p` attaches a handler and throws the reason inside the `try`: `caught late`.

There is no unhandled-rejection report. Browsers only report a rejection that is still unhandled once the microtask queue has drained, and the handler was attached before then. If the `await p` came after a `setTimeout`, you would get an `unhandledrejection` warning even though the error is caught later.

Rule to remember: a rejection is only "unhandled" if no one has handled it by the time the microtasks drain. Attach handlers early.
