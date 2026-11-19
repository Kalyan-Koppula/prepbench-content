**Key insight:** debouncing a *value* is an effect with cleanup: every change schedules a timer, and the cleanup from the previous render cancels the old one.

## Approach

`useState(value)` holds the debounced copy. An effect keyed on `[value, delay]` sets a timer that copies `value` into state; its cleanup clears that timer. When `value` changes again before the timer fires, React runs the cleanup first, so only the last change survives. Unmounting also runs the cleanup, so no update happens after unmount.

## Walkthrough

Typing "react" quickly with `delay = 300`:

| Time | `value` | Effect | `debounced` |
| --- | --- | --- | --- |
| 0 | r | timer A (fires at 300) | '' |
| 80 | re | cleanup clears A; timer B (380) | '' |
| 160 | rea | clears B; timer C (460) | '' |
| 240 | reac | clears C; timer D (540) | '' |
| 320 | react | clears D; timer E (620) | '' |
| 620 | – | E fires | 'react' |

Each new value's effect cleanup cancels the previous timer, so the debounced value updates only after the input pauses. A search component then fetches with `debounced`, not `value`.

## What to test

- Rapid changes produce one update after the delay.
- A single change updates after the delay.
- Unmounting cancels the pending timer.
- Changing `delay` restarts the timer.

## Pitfalls

- Debouncing the setter with a stale closure (`useCallback(debounce(...), [])`) captures the first value forever.
- Forgetting `delay` in the dependencies means a changed delay is ignored until the next value change.

## Follow-ups

- `useDebouncedCallback(fn, delay)`: keep the latest `fn` in a ref so the debounced function identity is stable.
- Add `leading` behaviour, or a `flush` that commits immediately (e.g. on Enter).

## In the interview

Contrast with `useDebouncedCallback` (debounces a function call) and with `useDeferredValue` (lets React render urgent updates first, without a fixed delay).
