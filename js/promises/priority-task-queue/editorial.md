**Key insight:** a promise-returning `add` just parks `{ task, priority, resolve, reject }` in a list. The scheduling decision happens only when the queue becomes free, which is why priorities added later can still jump ahead of earlier, lower-priority tasks.

## Approach

1. `add` returns `new Promise((resolve, reject) => { waiting.push({ … }); runNext() })`.
2. `runNext()`: if `busy` or nothing waits, return. Otherwise find the index of the highest priority with a strict `>` (earliest wins ties), `splice` it out, set `busy`.
3. Run the task (synchronous throws become rejections), forward its outcome to the job's `resolve`/`reject`, then clear `busy` and call `runNext()` again.

A linear scan is fine for interview-sized queues. For thousands of tasks, use a binary heap keyed by `(priority, insertion counter)`; the counter keeps the heap stable.

## Walkthrough

A queue that runs one task at a time, highest priority first:

```js
const q = new TaskQueue()
q.add(() => work('A'), 1) // starts immediately (queue was idle)
q.add(() => work('B'), 1)
q.add(() => work('C'), 5)
q.add(() => work('D'), 5)
```

| Moment | Running | Waiting (priority) | Next picked |
| --- | --- | --- | --- |
| After the adds | A | B(1), C(5), D(5) | – |
| A finishes | – | B(1), C(5), D(5) | C (highest; earliest among ties) |
| C finishes | – | B(1), D(5) | D |
| D finishes | – | B(1) | B |

Order: A, C, D, B. A wasn't pre-empted: priority only decides which waiting task starts next.

## Complexity

Picking the next task scans the waiting list: `O(n)`. With many waiting tasks, use a binary heap keyed by `(priority, insertion order)` for `O(log n)`.

## Edge cases to test

- Only one task runs at a time.
- Higher priority runs first; ties keep insertion order.
- Each `add` resolves or rejects with its own task's outcome.
- A failing task doesn't stop the queue.
- `size` reports waiting tasks.

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

## In the interview

State the scheduling rules (non-preemptive, stable ties), then mention the heap optimisation and extensions: a concurrency limit greater than one, and ageing so low-priority tasks don't starve.
