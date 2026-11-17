---
title: Priority task queue
difficulty: Medium
order: 15
tags: [promises, queues, classes, scheduling]
frequency: medium
exports: [TaskQueue]
hints:
  - "`add` returns a new Promise; store the task together with that promise's `resolve` and `reject` and its priority."
  - Keep a `busy` flag. When a task finishes (either way), clear the flag and start the next one.
  - To pick the next task, scan for the highest priority and use a strict `>` so the earliest-added task wins a tie.
---

Implement a class `TaskQueue` that runs async tasks **one at a time**, choosing the **highest-priority** waiting task each time it becomes free.

- `add(task, priority = 0)` queues `task` (a function returning a promise or a value) and returns a promise that settles with the task's own outcome.
- If the queue is idle, `add` starts the task **immediately** (synchronously).
- When the running task finishes, the queue starts the waiting task with the highest `priority` (larger number first). Tasks with equal priority run in the order they were added.
- A running task is never interrupted, whatever gets added while it runs.
- `size` (a getter) is the number of tasks **waiting**, not counting the one running.

```js
const queue = new TaskQueue()
queue.add(() => upload('a.png'))       // starts now
queue.add(() => prefetch('next-page')) // priority 0
queue.add(() => saveDraft(), 10)       // runs next, ahead of the prefetch
```

## Notes

- A task that rejects or throws rejects its own promise; the queue carries on with the next task.
- Priorities can be any numbers, including negative ones.
