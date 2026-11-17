**Key insight:** model the state explicitly: one wait timer that marks "a burst is in progress", one optional `maxWait` timer, and a single *pending call* slot. Every edge (leading, trailing, maxWait, flush) is just "run the pending call if there is one, then clear the slot".

## Approach

1. On each call, record `{ this, args }` as the pending call and restart the wait timer. If no wait timer was running, this call starts a burst.
2. At the start of a burst, start the `maxWait` timer and, if `leading`, run the pending call right away (which empties the slot).
3. When the wait timer fires (or `flush()` is called), end the burst: clear both timers, then run the pending call if `trailing` is on and the slot isn't empty.
4. When the `maxWait` timer fires, restart it and run the pending call if there is one. The burst continues.
5. `cancel()` clears both timers and the slot without running anything.
6. Keep the last return value of `fn` in the closure and return it from every call and from `flush()`.

## Pitfalls

- Using a boolean like "called leading" instead of the pending slot: with `leading` and `trailing` both on, a single call then runs twice.
- Starting the burst on "time since last run" instead of "is the wait timer running": in leading-only mode every call must push the burst's end further away; that is exactly what separates this from throttle.
- Forgetting to clear the `maxWait` timer when the burst ends leaves an interval-like timer running forever.
- `cancel()` that clears the timer but leaves the burst flag set: the next call is not treated as a leading edge.
- Clear state *before* calling `fn`; if `fn` calls the debounced function again, it should see a fresh burst.

## Follow-ups interviewers add

- **Throttle on top of debounce:** `throttle(fn, wait) = debounce(fn, wait, { leading: true, maxWait: wait })`. Why does that work?
- **`pending()`:** report whether a trailing call is waiting.
- **Timestamps instead of two timers:** lodash keeps `lastCallTime` and `lastInvokeTime` and a single timer; compare the trade-offs.
- **Promise API:** make the debounced function return a promise that settles with the result of the run it was folded into.
