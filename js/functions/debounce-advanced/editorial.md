**Key insight:** model the state explicitly: one wait timer that marks "a burst is in progress", one optional `maxWait` timer, and a single *pending call* slot. Every edge (leading, trailing, maxWait, flush) is just "run the pending call if there is one, then clear the slot".

## Approach

1. On each call, record `{ this, args }` as the pending call and restart the wait timer. If no wait timer was running, this call starts a burst.
2. At the start of a burst, start the `maxWait` timer and, if `leading`, run the pending call right away (which empties the slot).
3. When the wait timer fires (or `flush()` is called), end the burst: clear both timers, then run the pending call if `trailing` is on and the slot isn't empty.
4. When the `maxWait` timer fires, restart it and run the pending call if there is one. The burst continues.
5. `cancel()` clears both timers and the slot without running anything.
6. Keep the last return value of `fn` in the closure and return it from every call and from `flush()`.

## Walkthrough

`debounce(fn, 100, { leading: true, trailing: true, maxWait: 250 })`, with calls every 60 ms from 0 to 420 ms:

| Time | Event | Effect |
| --- | --- | --- |
| 0 | first call (burst starts) | leading edge: `fn` runs now; wait timer → 100; max timer → 250 |
| 60–240 | calls keep coming | the wait timer resets on each call; each call replaces `pending` |
| 250 | max timer fires | runs the pending call (from 240); max timer restarts → 500 |
| 300–420 | more calls | the wait timer resets; `pending` is the call from 420 |
| 500 | max timer fires | runs the pending call (from 420); max timer restarts → 750 |
| 520 | wait timer fires (100 ms after the last call) | burst ends: both timers cleared; nothing pending, so no trailing run |

During a continuous stream, `fn` runs at least every 250 ms; when the stream stops, a final trailing run happens only if there's a call that hasn't run yet.

`flush()` at any point ends the burst immediately and runs the pending call; `cancel()` ends it and drops the pending call.

## Complexity

`O(1)` per call; at most two timers exist at any moment.

## Edge cases to test

- `leading` only: one run at the start of each burst, none at the end.
- `trailing` only (the default): one run at the end.
- Both: a single call runs once (leading), not twice.
- `maxWait` during a continuous stream: runs at least every `maxWait` ms.
- `flush()` returns the latest result; `cancel()` resets so the next call is a leading edge.

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

## In the interview

Define "burst" first (calls while the wait timer is running), then show how each option maps to the burst's start, its end, or a periodic tick. Mention that `throttle` is `debounce` with `maxWait` equal to `wait` and both edges enabled, which is how lodash implements it.
