**Key insight:** a throttle is a gate with a memory of one. While the gate is closed, every call overwrites a single "saved call" slot; when the timer reopens the gate, the saved call (if any) runs and closes it again.

## Approach

1. Keep `timer` (window open?) and `saved` (latest call during the window) in the closure.
2. On a call with no window open: open a window with `setTimeout(close, wait)` and run `fn` with this call's `this` and arguments.
3. On a call during a window: overwrite `saved` with `{ this, args }`.
4. When the window closes: if `saved` is set, clear it, open a new window and run it; otherwise mark the window closed.

## Pitfalls

- Dropping calls during the window entirely (no trailing run) means the final state, like the last scroll position, is never reported.
- Running the trailing call without opening a new window lets a call that arrives right after it run immediately, so two runs land back to back.
- Keeping *all* calls from the window in a queue; only the latest one matters.
- Using an arrow function as the returned wrapper, which loses the caller's `this`.

## Follow-ups interviewers add

- **Options:** `leading: false` (wait for the end of the first window) and `trailing: false` (drop calls in the window). See *Throttle with options and cancel*.
- **`cancel()`** and returning the last result.
- **Timestamps instead of timers:** compute `remaining = wait - (now - lastRun)` on each call; compare it with this timer-only version.
- **`requestAnimationFrame` throttle:** run at most once per frame for scroll and resize handlers.
- **Throttle vs debounce:** which would you use for search-as-you-type, infinite scroll, a resize handler, a "save" button?
