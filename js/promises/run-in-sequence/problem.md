---
title: Run tasks in sequence
difficulty: Easy
order: 11
tags: [promises, async-await, reduce]
frequency: medium
exports: [runInSequence]
hints:
  - A `for…of` loop with `await` inside an `async` function runs one task at a time.
  - Keep the previous result in a variable and pass it into the next task.
---

Implement `runInSequence(tasks, initialValue)`. Each task is a function that may return a promise. Run them **one after another**: a task starts only after the previous one has fulfilled, and it receives the previous task's result as its argument (the first task receives `initialValue`).

The returned promise fulfils with an array of every task's result, in order.

```js
const results = await runInSequence(
  [
    (id) => fetchUser(id),             // gets 7
    (user) => fetchTeam(user.teamId),  // gets the user
    (team) => team.name.toUpperCase(), // gets the team
  ],
  7,
)
// [user, team, 'PLATFORM']
```

## Notes

- The first task is called synchronously, when `runInSequence` is called.
- If a task rejects or throws, reject with that error and do not call any later tasks.
- Tasks may return plain values or thenables.
- No tasks: fulfil with `[]`.
