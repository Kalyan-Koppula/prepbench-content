**Key insight:** a promise-returning `add` just parks `{ task, priority, resolve, reject }` in a list. The scheduling decision happens only when the queue becomes free, which is why priorities added later can still jump ahead of earlier, lower-priority tasks.

## Approach

1. `add` returns `new Promise((resolve, reject) => { waiting.push({ … }); runNext() })`.
2. `runNext()`: if `busy` or nothing waits, return. Otherwise find the index of the highest priority with a strict `>` (earliest wins ties), `splice` it out, set `busy`.
3. Run the task (synchronous throws become rejections), forward its outcome to the job's `resolve`/`reject`, then clear `busy` and call `runNext()` again.

A linear scan is fine for interview-sized queues. For thousands of tasks, use a binary heap keyed by `(priority, insertion counter)`; the counter keeps the heap stable.

## Pitfalls

- Sorting on `add` with an unstable comparison, or using `>=` in the scan: equal priorities then run in the wrong order.
- Clearing `busy` only on success: one failed task stalls the queue forever.
- Starting the next task from inside `add` without checking `busy`: two tasks run at once.
- Making `size` include the running task; the statement says waiting only.

## Follow-ups interviewers add

- **Concurrency N:** replace `busy` with a running counter.
- **`onIdle()`**: a promise that resolves when nothing is running or waiting.
- **Starvation:** low-priority tasks may never run under constant high-priority load. Add aging (priority grows with wait time).
- **Cancel / reprioritise** a waiting task by id.
