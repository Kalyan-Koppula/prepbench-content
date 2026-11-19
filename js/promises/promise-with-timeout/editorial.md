**Key insight:** it is `Promise.race` between the input and a rejecting timer, written by hand so you can clear the timer as soon as the input wins.

## Approach

1. Inside `new Promise((resolve, reject) => …)`, start `setTimeout` that rejects with a `TimeoutError` after `ms`.
2. Subscribe to `Promise.resolve(promise)`: on either outcome, `clearTimeout(timer)` and forward it.
3. No flags are needed: once the timer has rejected, the later `resolve` is a no-op.

## Walkthrough

`withTimeout(fetch(url), 500)`:

| Case | What happens |
| --- | --- |
| Fetch resolves at 200 ms | Timer cleared, resolves with the response |
| Fetch rejects at 100 ms | Timer cleared, rejects with the fetch error |
| Fetch still pending at 500 ms | Rejects with a `TimeoutError`; the fetch itself **keeps running** |

Clearing the timer on settlement matters: without it, a long timeout would keep Node processes alive and fire a pointless rejection later (ignored, but wasteful).

## Complexity

`O(1)`.

## Edge cases to test

- Resolves before the timeout.
- Rejects before the timeout (original reason preserved).
- Times out: the error has `name === 'TimeoutError'`.
- The timer is cleared after settlement (fake timers make this checkable).

## Pitfalls

- `Promise.race([promise, sleep(ms).then(() => { throw … })])` works but leaves the timer running after a fast response: in Node that keeps the process alive, in a UI it fires a pointless callback.
- Rejecting with a string or a generic `Error`; callers need `name === 'TimeoutError'` to tell a timeout from a server error.
- Assuming the timeout cancels the work. The request keeps running; use an `AbortController` (see Cancellable task) to stop it.

## Follow-ups interviewers add

- **Real cancellation:** take a function `(signal) => promise` and abort the signal when the timer fires.
- **`AbortSignal.timeout(ms)`** and `AbortSignal.any([...])`: the platform versions of this pattern.
- **Retry on timeout:** combine with Retry with backoff, giving each attempt its own timeout.

## In the interview

After the basic version, say the honest limitation: the underlying work isn't cancelled. Offer the improved API: accept an `AbortSignal`, or for `fetch` use `AbortSignal.timeout(ms)`.
