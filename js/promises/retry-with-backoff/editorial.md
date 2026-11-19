**Key insight:** with `async`/`await` a retry is just a `for` loop around `try { return await fn() }`. The only decisions live in the `catch`: give up (re-throw) or sleep for the next backoff interval and loop.

## Approach

1. Read the options with defaults via destructuring.
2. `for (let attempt = 1; ; attempt++)`:
   - `try { return await fn(attempt) }`: `await` turns both a rejected promise and a synchronous throw into a `catch`.
   - In `catch`, if `attempt >= attempts` or `!shouldRetry(error, attempt)`, re-throw.
   - Otherwise `await sleep(Math.min(delay * factor ** (attempt - 1), maxDelay))`.
3. `sleep` is `ms => new Promise(r => setTimeout(r, ms))`.

## Walkthrough

`retry(flakyFetch, { attempts: 4, delay: 100, factor: 2 })` where the first two attempts fail:

| Attempt | Result | Wait before next |
| --- | --- | --- |
| 1 | fails | 100 ms (`100 × 2⁰`) |
| 2 | fails | 200 ms (`100 × 2¹`) |
| 3 | succeeds | – |

If attempt 4 also failed, the last error would be thrown. `shouldRetry(error, attempt)` can stop early, for example on a 400 response that will never succeed. `maxDelay` caps the exponential growth.

## Complexity

At most `attempts` calls; the total waiting is the sum of the delays, bounded by `maxDelay` per wait.

## Edge cases to test

- Success on the first try (no delay).
- Success after some failures.
- All attempts fail: the **last** error is thrown.
- `shouldRetry` returning false stops immediately.
- Delays grow by `factor` and respect `maxDelay` (test with fake timers).

## Pitfalls

- Off-by-one in the backoff: the first wait is `delay`, not `delay * factor`.
- Treating `attempts` as "retries": three attempts is two retries.
- Rejecting with the first error instead of the most recent one, which is usually the most relevant.
- Calling `shouldRetry` after the last attempt; it then looks like the caller can extend the loop when it cannot.
- `return fn(attempt)` without `await` inside `try`: a rejected promise escapes the `catch` and is never retried.

## Follow-ups interviewers add

- **Jitter:** randomise each wait (`wait * (0.5 + Math.random() / 2)`) so many clients don't retry in lockstep.
- **`Retry-After`:** respect a server-provided delay from the error.
- **Cancellation:** accept an `AbortSignal` and stop sleeping when it aborts.
- **Per-attempt timeout:** wrap each call with `withTimeout`.

## In the interview

Mention jitter (randomising delays so clients that failed together don't retry together), honouring `Retry-After` headers, and only retrying idempotent operations.
