**Key insight:** a timeout you can control needs two refs: one for the latest callback (so re-renders don't move the deadline) and one for the timer id (so `clear` and `reset` can reach it from event handlers).

## Approach

Mirror `callback` into `saved.current` in an effect. `clear` clears `timer.current` if set. `reset` calls `clear`, returns early for a `null` delay, and otherwise stores `setTimeout(() => { timer.current = null; saved.current() }, delay)`. Both are `useCallback`s (`reset` depends on `delay`). One effect runs `reset()` and returns `clear`, so the countdown starts on mount, restarts when `delay` changes, and is cancelled on unmount.

## Walkthrough

```jsx
const { reset, clear } = useTimeout(() => setVisible(false), 3000) // auto-hide a toast
// a new message arrives: reset() restarts the 3-second timer
// the user hovers the toast: clear() keeps it open
```

| Event | Effect |
| --- | --- |
| mount | timer starts |
| `reset()` | clears and restarts the timer |
| `clear()` | cancels it |
| `delay` changes | restart with the new delay |
| unmount | cancelled |

The callback is read from a ref when the timer fires, so it sees the latest state without restarting the timer on every render.

## What to test

- Fires once after the delay.
- `reset` restarts; `clear` cancels.
- A `null` delay doesn't start a timer.
- Unmounting before it fires prevents the callback.

## Pitfalls

- Listing `callback` in the scheduling effect's dependencies: an inline arrow restarts the countdown every render, so a component that re-renders often never fires.
- Keeping the timer id in a local variable inside the effect: `clear` and `reset`, called from event handlers, can't see it.
- `reset` that schedules without clearing first ends up firing twice.
- Not nulling the id after it fires is harmless here but makes "is pending?" checks wrong if you add them.

## Follow-ups

- Return `isPending`, which needs state rather than a ref so it re-renders.
- `useTimeoutFn` that does not start on mount, only on `reset()`.
- Build `useDebouncedCallback` on top of the same refs.

## In the interview

Same ref pattern as `useInterval`. Mention that `reset` and `clear` are stable callbacks so they're safe in dependency arrays.
