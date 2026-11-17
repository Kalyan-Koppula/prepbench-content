**Key insight:** polling is a loop whose "iterations" are timer callbacks. Two timers can be alive at once (the next poll and the deadline), so funnel every exit through one `finish` that sets a `done` flag and clears both.

## Approach

1. If `timeout` is finite, start a deadline timer that calls `finish(reject(TimeoutError))`.
2. `poll()`: call `fn` (synchronous throws become rejections), then in `.then`:
   - if `done`, return (a late result after the deadline);
   - if `predicate(result)`, `finish(resolve(result))`;
   - otherwise schedule `poll` after `min(interval * factor ** waits++, maxInterval)`.
3. A trailing `.catch` sends errors from `fn` *or* the predicate to `finish(reject(error))`.
4. Call `poll()` once to start.

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
