**Key insight:** debouncing a *value* is an effect with cleanup: every change schedules a timer, and the cleanup from the previous render cancels the old one.

## Approach

`useState(value)` holds the debounced copy. An effect keyed on `[value, delay]` sets a timer that copies `value` into state; its cleanup clears that timer. When `value` changes again before the timer fires, React runs the cleanup first, so only the last change survives. Unmounting also runs the cleanup, so no update happens after unmount.

## Pitfalls

- Debouncing the setter with a stale closure (`useCallback(debounce(...), [])`) captures the first value forever.
- Forgetting `delay` in the dependencies means a changed delay is ignored until the next value change.

## Follow-ups

- `useDebouncedCallback(fn, delay)`: keep the latest `fn` in a ref so the debounced function identity is stable.
- Add `leading` behaviour, or a `flush` that commits immediately (e.g. on Enter).
