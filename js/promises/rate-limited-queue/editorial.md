**Key insight:** a sliding-window limiter only needs the timestamps of the last `limit` starts. A slot frees up exactly when the oldest of those leaves the window, so one timer aimed at `oldest + windowMs` is enough. No polling, no `setInterval`.

## Approach

1. Keep `starts` (start times, oldest first), a FIFO `queue` of `{ task, resolve, reject }`, and one optional `timer`.
2. `drain()`:
   - drop start times with `start + windowMs <= now`;
   - while the queue is non-empty and `starts.length < limit`, record `now` and run the next job (forwarding its outcome);
   - if jobs are still waiting, set `timer = setTimeout(drain, starts[0] + windowMs - now)`.
3. `schedule(task)` queues the job and calls `drain()` unless a timer is already pending (a pending timer means the window is full and the queue will be drained in order).

## Pitfalls

- **Fixed buckets** (reset a counter every `windowMs`): allows up to `2 × limit` calls around a bucket edge. The sliding-window test catches this.
- **Limiting concurrency instead of starts:** waiting for tasks to finish before freeing a slot is a different limiter.
- **One timer per task:** works, but scheduling 1,000 tasks creates 1,000 timers and their order relies on timer tie-breaking.
- **Starting a new task ahead of waiting ones** because a slot happens to be free when `schedule` is called; FIFO means the queue goes first.
- An interval that keeps ticking after the queue empties.

## Follow-ups interviewers add

- **Token bucket:** allow bursts up to `capacity`, refilling at a steady rate.
- **Combine limits:** at most 5 per second *and* 2 running at once.
- **Server feedback:** on a 429 with `Retry-After`, pause the whole limiter.
- **Priorities** or per-key limits (one limiter per API host).
