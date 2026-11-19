**Key insight:** throttling is "debounce with a deadline". Track when the output last changed; if the window has passed, update now, otherwise schedule the update for exactly when it ends.

## Approach

State holds the shown value; refs hold a copy of it and the timestamp of the last time it changed (initialised at mount). An effect on `[value, interval]` returns early if `value` is already the shown one (on mount, or when the input flips back), otherwise computes `elapsed`. If `elapsed >= interval` it records the time and sets the value right away. Otherwise it schedules `setTimeout(..., interval - elapsed)` that does the same. The cleanup clears that timer, so when another value arrives during the window the old scheduled update is replaced by one carrying the newer value, still aimed at the same deadline. Unmount runs the cleanup too.

## Walkthrough

`useThrottledValue(scrollY, 100)` while scrolling continuously:

| Time | New `value` | Since last shown | Action |
| --- | --- | --- | --- |
| 0 | 0 | (mount) | shown: 0 |
| 30 | 40 | 30 ms | schedule an update at 100 |
| 60 | 90 | 60 ms | reschedule with the latest value |
| 100 | – | – | show 90 |
| 130 | 150 | 30 ms | schedule at 200 |
| 200 | – | – | show 150 |

The throttled value updates at most once per interval during continuous change, and the final value always lands (trailing update).

## What to test

- First change after a quiet period shows immediately.
- Continuous changes update at most once per interval.
- The last value is eventually shown.
- Timers are cleaned up on unmount and on changes.

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

## In the interview

Contrast with the debounced value (waits for silence) and mention that scroll-linked visuals are often better served by `requestAnimationFrame`, CSS scroll-driven animations or `IntersectionObserver`.
