**Key insight:** polling is a loop whose "iterations" are timer callbacks. Two timers can be alive at once (the next poll and the deadline), so funnel every exit through one `finish` that sets a `done` flag and clears both.

## Approach

1. If `timeout` is finite, start a deadline timer that calls `finish(reject(TimeoutError))`.
2. `poll()`: call `fn` (synchronous throws become rejections), then in `.then`:
   - if `done`, return (a late result after the deadline);
   - if `predicate(result)`, `finish(resolve(result))`;
   - otherwise schedule `poll` after `min(interval * factor ** waits++, maxInterval)`.
3. A trailing `.catch` sends errors from `fn` *or* the predicate to `finish(reject(error))`.
4. Call `poll()` once to start.

## Walkthrough

`pollUntil(() => getJob(id), (job) => job.status === 'done', { interval: 500, factor: 2, maxInterval: 4000, timeout: 30000 })`:

| Poll | Status | Wait before next |
| --- | --- | --- |
| 1 (t = 0) | queued | 500 ms |
| 2 (t ≈ 0.5 s) | running | 1000 ms |
| 3 (t ≈ 1.5 s) | running | 2000 ms |
| 4 (t ≈ 3.5 s) | running | 4000 ms (capped) |
| 5 (t ≈ 7.5 s) | done | resolve with the job |

If the predicate never passes within 30 s, the promise rejects with a `TimeoutError` and no further polls are scheduled. A poll that throws (network error) rejects the whole operation in this version.

## Complexity

One call per poll; the number of polls grows roughly logarithmically with time when backing off.

## Edge cases to test

- Resolves on the first poll if the predicate already passes.
- Interval growth by `factor`, capped by `maxInterval`.
- Timeout rejects and stops scheduling.
- An error thrown by `fn` rejects.
- No timers left behind after settling.

## Pitfalls

- `setInterval`: it fires on a fixed schedule even while a slow request is still running, so polls overlap and pile up.
- Checking the deadline only before each poll, so the rejection arrives late (up to a full interval after the timeout).
- Forgetting the `done` check: a slow poll that returns after the timeout schedules more polls that nobody is waiting for.
- Calling `setTimeout(fn, Infinity)`: browsers treat delays above 2^31 - 1 ms as `0`, firing immediately. Skip the deadline timer when there is no timeout.

## Follow-ups interviewers add

- **Cancellation:** accept an `AbortSignal` to stop polling when the user navigates away.
- **Pause when hidden:** stop while `document.visibilityState === 'hidden'`, resume on `visibilitychange`.
- **Server hints:** honour a `Retry-After` header instead of the computed wait.
- **Long polling vs WebSockets vs SSE:** when is polling the right choice?

## In the interview

Discuss when polling is appropriate (no push channel available) and the alternatives (webhooks, SSE, WebSockets). Mention jitter and server hints like `Retry-After`.
