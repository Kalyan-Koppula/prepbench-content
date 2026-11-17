**Key insight:** throttling is "debounce with a deadline". Track when the output last changed; if the window has passed, update now, otherwise schedule the update for exactly when it ends.

## Approach

State holds the shown value; refs hold a copy of it and the timestamp of the last time it changed (initialised at mount). An effect on `[value, interval]` returns early if `value` is already the shown one (on mount, or when the input flips back), otherwise computes `elapsed`. If `elapsed >= interval` it records the time and sets the value right away. Otherwise it schedules `setTimeout(..., interval - elapsed)` that does the same. The cleanup clears that timer, so when another value arrives during the window the old scheduled update is replaced by one carrying the newer value, still aimed at the same deadline. Unmount runs the cleanup too.

## Pitfalls

- Scheduling a fresh full `interval` on every change (`setTimeout(..., interval)` with cleanup) turns it into a debounce: nothing shows until the input stops.
- Ignoring changes during the window ("if too soon, return") drops the final value; the UI ends up out of date.
- Storing the timestamp in state instead of a ref causes extra renders and stale reads in the effect.
- Scheduling an update for a value that is already shown (the mount effect, for instance) restarts the window for nothing and delays the next real change.
- Forgetting the cleanup: several timers each set an older value, and the last one to fire may not be the newest.

## Follow-ups

- `useThrottledCallback(fn, interval)` with the same leading + trailing behaviour.
- Throttle to animation frames instead of a fixed interval (`requestAnimationFrame`).
- When would you pick throttle over debounce? (Continuous feedback such as scroll, resize, drag; versus "act once it settles", such as search.)
