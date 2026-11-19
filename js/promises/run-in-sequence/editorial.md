**Key insight:** sequencing is what `await` in a loop does naturally. The classic pre-`async` version is a `reduce` that chains `.then` calls: `tasks.reduce((p, task) => p.then(task), Promise.resolve(initial))`.

## Approach

1. Make the function `async`.
2. `let previous = initialValue`; for each task, `previous = await task(previous)` and push it into `results`.
3. Return `results`. A rejection (or synchronous throw) inside the loop rejects the async function and the loop stops.

## Walkthrough

`runInSequence([x => x + 1, async x => x * 2, x => x - 3], 5)`:

| Step | Input | Output | `results` |
| --- | --- | --- | --- |
| 1 | 5 | 6 | [6] |
| 2 | 6 | 12 (after awaiting) | [6, 12] |
| 3 | 12 | 9 | [6, 12, 9] |

Each task starts only after the previous one settles, and receives its result. If any task rejects, the `await` throws and the whole sequence rejects with that error.

## Complexity

`O(n)`; total time is the sum of the tasks' times.

## Edge cases to test

- Synchronous and asynchronous tasks mixed.
- Each task receives the previous result.
- An empty list resolves to `[]`.
- A failure stops the sequence (later tasks never run).

## Pitfalls

- `tasks.map(task => task())` or `forEach(async …)`: every task starts at once, and `forEach` does not wait for async callbacks at all.
- In the `reduce` version, calling `task()` while building the chain (`p.then(task())`) instead of passing the function.
- Swallowing errors with a `try/catch` that only logs, so later tasks run with `undefined`.

## Follow-ups interviewers add

- **Compose instead:** return a function `pipeAsync(...fns)(input)`.
- **Mixed parallelism:** run groups of tasks in parallel, groups in sequence.
- **Progress reporting:** call `onProgress(done, total)` after each step.
- **Cancellation:** check an `AbortSignal` between steps.

## In the interview

Show the `for...of` + `await` version first, then the `reduce` over a promise chain as an alternative, and explain why `forEach` with an async callback would not wait.
