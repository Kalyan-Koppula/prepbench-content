**Key insight:** it is `Promise.race` between the input and a rejecting timer, written by hand so you can clear the timer as soon as the input wins.

## Approach

1. Inside `new Promise((resolve, reject) => …)`, start `setTimeout` that rejects with a `TimeoutError` after `ms`.
2. Subscribe to `Promise.resolve(promise)`: on either outcome, `clearTimeout(timer)` and forward it.
3. No flags are needed: once the timer has rejected, the later `resolve` is a no-op.

## Pitfalls

- `Promise.race([promise, sleep(ms).then(() => { throw … })])` works but leaves the timer running after a fast response: in Node that keeps the process alive, in a UI it fires a pointless callback.
- Rejecting with a string or a generic `Error`; callers need `name === 'TimeoutError'` to tell a timeout from a server error.
- Assuming the timeout cancels the work. The request keeps running; use an `AbortController` (see Cancellable task) to stop it.

## Follow-ups interviewers add

- **Real cancellation:** take a function `(signal) => promise` and abort the signal when the timer fires.
- **`AbortSignal.timeout(ms)`** and `AbortSignal.any([...])`: the platform versions of this pattern.
- **Retry on timeout:** combine with Retry with backoff, giving each attempt its own timeout.
