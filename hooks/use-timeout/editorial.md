**Key insight:** a timeout you can control needs two refs: one for the latest callback (so re-renders don't move the deadline) and one for the timer id (so `clear` and `reset` can reach it from event handlers).

## Approach

Mirror `callback` into `saved.current` in an effect. `clear` clears `timer.current` if set. `reset` calls `clear`, returns early for a `null` delay, and otherwise stores `setTimeout(() => { timer.current = null; saved.current() }, delay)`. Both are `useCallback`s (`reset` depends on `delay`). One effect runs `reset()` and returns `clear`, so the countdown starts on mount, restarts when `delay` changes, and is cancelled on unmount.

## Pitfalls

- Listing `callback` in the scheduling effect's dependencies: an inline arrow restarts the countdown every render, so a component that re-renders often never fires.
- Keeping the timer id in a local variable inside the effect: `clear` and `reset`, called from event handlers, can't see it.
- `reset` that schedules without clearing first ends up firing twice.
- Not nulling the id after it fires is harmless here but makes "is pending?" checks wrong if you add them.

## Follow-ups

- Return `isPending`, which needs state rather than a ref so it re-renders.
- `useTimeoutFn` that does not start on mount, only on `reset()`.
- Build `useDebouncedCallback` on top of the same refs.
