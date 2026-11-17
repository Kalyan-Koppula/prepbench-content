**Key insight:** sequencing is what `await` in a loop does naturally. The classic pre-`async` version is a `reduce` that chains `.then` calls: `tasks.reduce((p, task) => p.then(task), Promise.resolve(initial))`.

## Approach

1. Make the function `async`.
2. `let previous = initialValue`; for each task, `previous = await task(previous)` and push it into `results`.
3. Return `results`. A rejection (or synchronous throw) inside the loop rejects the async function and the loop stops.

## Pitfalls

- `tasks.map(task => task())` or `forEach(async …)`: every task starts at once, and `forEach` does not wait for async callbacks at all.
- In the `reduce` version, calling `task()` while building the chain (`p.then(task())`) instead of passing the function.
- Swallowing errors with a `try/catch` that only logs, so later tasks run with `undefined`.

## Follow-ups interviewers add

- **Compose instead:** return a function `pipeAsync(...fns)(input)`.
- **Mixed parallelism:** run groups of tasks in parallel, groups in sequence.
- **Progress reporting:** call `onProgress(done, total)` after each step.
- **Cancellation:** check an `AbortSignal` between steps.
