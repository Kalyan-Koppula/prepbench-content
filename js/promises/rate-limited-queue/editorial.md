**Key insight:** a sliding-window limiter only needs the timestamps of the last `limit` starts. A slot frees up exactly when the oldest of those leaves the window, so one timer aimed at `oldest + windowMs` is enough. No polling, no `setInterval`.

## Approach

1. Keep `starts` (start times, oldest first), a FIFO `queue` of `{ task, resolve, reject }`, and one optional `timer`.
2. `drain()`:
   - drop start times with `start + windowMs <= now`;
   - while the queue is non-empty and `starts.length < limit`, record `now` and run the next job (forwarding its outcome);
   - if jobs are still waiting, set `timer = setTimeout(drain, starts[0] + windowMs - now)`.
3. `schedule(task)` queues the job and calls `drain()` unless a timer is already pending (a pending timer means the window is full and the queue will be drained in order).

## Walkthrough

`const schedule = createRateLimiter(2, 1000)` (at most 2 task starts per second), with five tasks added at t = 0:

| Time (ms) | Starts in the window | Action |
| --- | --- | --- |
| 0 | [] | start tasks 1 and 2; window full; timer for 1000 |
| 1000 | [0, 0] → both expire | start tasks 3 and 4; timer for 2000 |
| 2000 | expire again | start task 5; queue empty, no timer |

Unlike `asyncPool`, which limits how many run **at once**, this limits how many **start** per window, which is what API rate limits usually mean. Each `schedule(task)` call gets a promise for its own task's result.

## Complexity

Amortised `O(1)` per task; memory is the queue plus at most `limit` timestamps.

## Edge cases to test

- No more than `limit` starts inside any window.
- Tasks start in submission order.
- Each promise settles with its own task's result or error.
- Idle periods reset the window (a new task starts immediately).
- Only one drain timer is pending at a time.

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

## In the interview

Contrast concurrency limits (pools, semaphores) with rate limits (tokens per time). Name the algorithm (sliding-window log) and mention the token bucket for smoother rates with bursts.
