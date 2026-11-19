**Key insight:** three things race (the task, the caller's abort, the timer), and all three exits must run the same `cleanup`. Giving the task its *own* controller lets you abort it for either reason (caller or timeout) without touching the caller's signal.

## Approach

1. If `signal?.aborted`, reject with an `AbortError` and return; an already-aborted signal never fires `abort` again.
2. Create `controller = new AbortController()`.
3. `cleanup()` clears the timer and calls `signal.removeEventListener('abort', onAbort)`.
4. `stop(error)` = `cleanup(); controller.abort(error); reject(error)`. `onAbort` and the timeout callback both call it with the right error.
5. Call `task(controller.signal)` in a `try`; route its outcome through `cleanup` and then `resolve`/`reject`.
6. Late outcomes need no guard: the promise has already settled, so the extra `resolve`/`reject` calls do nothing.

## Walkthrough

`cancellable((signal) => fetch(url, { signal }), { signal: userSignal, timeout: 2000 })`:

| Case | Outcome |
| --- | --- |
| Fetch finishes in 300 ms | Resolves with the response; timer and listener removed |
| The user aborts at 500 ms | Rejects with `AbortError`; the internal controller aborts, so the fetch stops |
| Nothing happens for 2000 ms | Rejects with `TimeoutError`; the fetch is aborted |
| `userSignal` already aborted | Rejects immediately without starting the task |

The task receives its **own** signal, which fires on either cause (user abort or timeout), so the work really stops instead of continuing in the background.

## Complexity

`O(1)` overhead.

## Edge cases to test

- Normal completion cleans up the timer and the abort listener.
- An external abort rejects with `name === 'AbortError'`.
- A timeout rejects with `name === 'TimeoutError'`.
- An already-aborted signal rejects without calling the task.
- The task's signal is aborted in both cancellation cases.

## Pitfalls

- Passing the caller's signal straight to the task: then a timeout cannot abort the task without aborting the caller's controller, which they may reuse.
- `addEventListener('abort', …, { once: true })` is not cleanup: the listener stays attached until an abort that may never come, and it keeps your closure (and the task) alive. Long-lived signals, like one per page, leak a listener per call.
- Leaving the timer running after the task finishes, so it later aborts a controller nobody cares about.
- Forgetting the already-aborted check, so the task starts and then hangs, because no `abort` event will fire.

## Follow-ups interviewers add

- **Platform helpers:** `AbortSignal.timeout(ms)` and `AbortSignal.any([a, b])` replace most of this; how would you polyfill `any`?
- **Reject with `signal.reason`** so callers can pass their own cancellation reason, as `fetch` does.
- **Cancellable sleep:** `sleep(ms, { signal })` built the same way.
- **React:** abort in an effect's cleanup so a fast re-render does not show stale data.

## In the interview

Explain the difference from `withTimeout` (that one only stops waiting; this one stops the work). Mention `AbortSignal.any([a, b])` and `AbortSignal.timeout(ms)` as the modern built-ins for combining signals.
