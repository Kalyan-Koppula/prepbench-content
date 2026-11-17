**Key insight:** the window is the only state that matters. A call either opens a window (run now or save, depending on `leading`) or lands in an open one (save). Closing a window either runs the saved call and opens the next one (`trailing`) or forgets it.

## Approach

1. Closure state: `timer` (is a window open), `saved` (latest unrun call with its `this`), `result` (last return value).
2. Call with no window open: open one with `setTimeout(close, wait)`; then run now if `leading`, else save the call.
3. Call inside a window: overwrite `saved`.
4. `close`: take `saved` and clear it. If `trailing` and there was one, open a new window and run it. Otherwise leave the window closed.
5. Always return `result`.
6. `cancel()`: `clearTimeout`, reset `timer` and `saved`.

## Pitfalls

- Restarting the timer on every call: that's debounce. In `trailing: false` mode a call at 120ms must run even though the previous call was at 60ms.
- With `leading: false`, forgetting to save the opening call means a single call never runs.
- Opening the next window *after* calling `fn`: if `fn` calls the throttled function, it would see no window and run again immediately.
- `cancel()` that clears the timer but leaves `timer` set, so the gate stays shut forever.

## Follow-ups interviewers add

- **lodash's version:** `throttle(fn, wait, opts)` is `debounce(fn, wait, { leading, trailing, maxWait: wait })`. Walk through why.
- **`flush()`:** run the saved call now.
- **Timestamps:** implement with `Date.now()` and a single timer; handle the clock jumping backwards.
- **Per-key throttling:** throttle analytics events per event name with one helper.
