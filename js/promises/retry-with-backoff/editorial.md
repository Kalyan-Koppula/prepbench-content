**Key insight:** with `async`/`await` a retry is just a `for` loop around `try { return await fn() }`. The only decisions live in the `catch`: give up (re-throw) or sleep for the next backoff interval and loop.

## Approach

1. Read the options with defaults via destructuring.
2. `for (let attempt = 1; ; attempt++)`:
   - `try { return await fn(attempt) }`: `await` turns both a rejected promise and a synchronous throw into a `catch`.
   - In `catch`, if `attempt >= attempts` or `!shouldRetry(error, attempt)`, re-throw.
   - Otherwise `await sleep(Math.min(delay * factor ** (attempt - 1), maxDelay))`.
3. `sleep` is `ms => new Promise(r => setTimeout(r, ms))`.

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
