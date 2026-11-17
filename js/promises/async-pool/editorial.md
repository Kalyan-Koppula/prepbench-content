**Key insight:** you don't need a scheduler loop. Start `limit` "workers"; each time a task finishes, its completion handler starts exactly one more. Concurrency stays at `limit` until the list runs out.

## Approach

1. Keep `next` (index of the next unstarted task), `finished`, `results[]`, and a `failed` flag.
2. `launch()`: if nothing is left or something failed, return. Otherwise take `index = next++`, call the task (inside `try`, so a synchronous throw becomes a rejection), and subscribe:
   - success: store `results[index]`; resolve when `finished === tasks.length`, otherwise `launch()` again;
   - failure: set `failed` and reject.
3. Call `launch()` `min(limit, tasks.length)` times. Resolve `[]` up front for an empty list.

An alternative is "N async workers" that each loop `while (next < tasks.length) await run(next++)`, combined with `Promise.all(workers)`.

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
