**Key insight:** three things race (the task, the caller's abort, the timer), and all three exits must run the same `cleanup`. Giving the task its *own* controller lets you abort it for either reason (caller or timeout) without touching the caller's signal.

## Approach

1. If `signal?.aborted`, reject with an `AbortError` and return; an already-aborted signal never fires `abort` again.
2. Create `controller = new AbortController()`.
3. `cleanup()` clears the timer and calls `signal.removeEventListener('abort', onAbort)`.
4. `stop(error)` = `cleanup(); controller.abort(error); reject(error)`. `onAbort` and the timeout callback both call it with the right error.
5. Call `task(controller.signal)` in a `try`; route its outcome through `cleanup` and then `resolve`/`reject`.
6. Late outcomes need no guard: the promise has already settled, so the extra `resolve`/`reject` calls do nothing.

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
