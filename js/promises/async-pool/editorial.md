**Key insight:** you don't need a scheduler loop. Start `limit` "workers"; each time a task finishes, its completion handler starts exactly one more. Concurrency stays at `limit` until the list runs out.

## Approach

1. Keep `next` (index of the next unstarted task), `finished`, `results[]`, and a `failed` flag.
2. `launch()`: if nothing is left or something failed, return. Otherwise take `index = next++`, call the task (inside `try`, so a synchronous throw becomes a rejection), and subscribe:
   - success: store `results[index]`; resolve when `finished === tasks.length`, otherwise `launch()` again;
   - failure: set `failed` and reject.
3. Call `launch()` `min(limit, tasks.length)` times. Resolve `[]` up front for an empty list.

An alternative is "N async workers" that each loop `while (next < tasks.length) await run(next++)`, combined with `Promise.all(workers)`.

## Walkthrough

`asyncPool([t1(300), t2(100), t3(200), t4(100)], 2)` (durations in ms):

| Time | Running | Event |
| --- | --- | --- |
| 0 | t1, t2 | start the first two |
| 100 | t1, t3 | t2 finishes → launch t3 |
| 300 | t3, t4 | t1 and t3 finish together; t4 launches |
| 400 | – | t4 finishes; all four done → resolve |

At most two tasks run at once. Results are stored by index, so the output order matches the input order, not completion order. Tasks are **functions** so the pool controls when each starts.

## Complexity

`O(n)` bookkeeping; total time depends on the tasks and the limit.

## Edge cases to test

- Never more than `limit` tasks running (count with a test instrument).
- Results in input order.
- A limit larger than the number of tasks.
- Empty task list.
- A failing task rejects the pool and stops launching new tasks.
- A task that throws synchronously.

## Pitfalls

- Batching (`Promise.all` on chunks of `limit`): a slow task in a chunk idles the other slots. The timing test catches this.
- Calling all the task functions up front (`tasks.map(t => t())`) starts every request immediately; the limit has to apply to *starting* work.
- Pushing results as they arrive, which scrambles the order.
- Forgetting the empty list: no completion handler ever runs, so the promise hangs.

## Follow-ups interviewers add

- **Return an async iterator** that yields results as they complete.
- **Settled mode:** don't stop on failure; return `allSettled`-style outcomes.
- **Dynamic queue:** tasks can be added while the pool is running (see Priority task queue and Rate-limited queue).
- **Abort the rest** on failure using an `AbortController` shared by the tasks.

## In the interview

Explain why it takes functions, not promises (a promise has already started). Mention alternatives: failing fast versus collecting all outcomes, and the worker-based version (`limit` workers each pulling the next index).
