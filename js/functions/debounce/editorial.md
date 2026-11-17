**Key insight:** the returned function owns one timer in a closure. Every call clears it and schedules a new one, so `fn` only runs once the calls stop for `wait` ms.

## Approach

1. Keep `timer` in the closure created by `debounce`.
2. On each call, `clearTimeout(timer)` and schedule `fn` again, remembering this call's `this` and `args`.
3. Use a regular `function` for the returned wrapper so it receives the caller's `this`, and an arrow inside `setTimeout` so that `this` carries through.
4. `cancel` clears the timer.

## Pitfalls

- Returning an arrow function from `debounce` loses the caller's `this`.
- Calling `fn(...args)` instead of `fn.apply(this, args)` breaks methods.
- Forgetting that `clearTimeout(undefined)` is harmless; no need to guard it.

## Follow-ups interviewers add

- **Leading edge:** call immediately on the first call of a burst, then ignore calls until the wait passes (`{ leading: true, trailing: false }`).
- **`flush()`:** run the pending call right now.
- **`maxWait`:** guarantee a call at least every N ms during a long burst; this is how lodash's `throttle` is built on `debounce`.
- **Return value:** return a promise that resolves with `fn`'s result when it finally runs.
