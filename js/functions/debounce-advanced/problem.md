---
title: Debounce with leading, trailing, flush and maxWait
difficulty: Hard
order: 2
tags: [timers, closures, this]
frequency: medium
exports: [debounce]
hints:
  - Think of a "burst" as the calls made while the wait timer is running. The first call of a burst is the leading edge; the moment the timer finally fires is the trailing edge.
  - Store the latest pending call (its `this` and arguments) and clear it whenever `fn` runs, so the trailing edge knows whether there is anything left to do.
  - "`maxWait` needs a second timer that starts with the burst and restarts each time it fires; ending the burst clears both timers."
---

Extend the classic debounce. Implement `debounce(fn, wait, options)` where `options` is an optional object:

| Option | Default | Meaning |
|---|---|---|
| `leading` | `false` | Run `fn` immediately on the first call of a burst. |
| `trailing` | `true` | Run `fn` when `wait` ms have passed since the last call, if there is a call that hasn't run yet. |
| `maxWait` | none | During a long burst, run the pending call at least once every `maxWait` ms. |

A **burst** starts with a call made when no wait timer is running and ends when `wait` ms pass with no further calls. Every call restarts the wait timer.

The returned function:

- returns the result of the most recent run of `fn` (or `undefined` if it hasn't run yet);
- has `cancel()`, which drops any pending call and ends the burst, so the next call is a leading edge again;
- has `flush()`, which ends the burst right now: if a trailing call is pending it runs immediately. `flush()` returns the latest result.

```js
const log = debounce((q) => console.log('search', q), 300, { leading: true })
log('r')     // "search r" right away (leading edge)
log('re')
log('rea')   // 300ms later: "search rea" (trailing edge)

const save = debounce(persist, 1000, { maxWait: 5000 })
// typing non-stop for 12s still saves at 5s and 10s, then once more after typing stops
```

## Notes

- `fn` always receives the `this` and arguments of the latest call that is being run.
- With `leading` and `trailing` both `true`, a burst of one call runs `fn` once, not twice.
- With `leading: true, trailing: false`, calls after the first one only extend the burst.
- When `maxWait` fires and a call is pending, run it; the burst keeps going and a trailing call can still follow. You can assume `maxWait > wait`, and `maxWait` won't be combined with `trailing: false`.
- No timers may be left running once a burst is over.
