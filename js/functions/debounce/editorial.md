**Key insight:** the returned function owns one timer in a closure. Every call clears it and schedules a new one, so `fn` only runs once the calls stop for `wait` ms.

## Approach

1. Keep `timer` in the closure created by `debounce`.
2. On each call, `clearTimeout(timer)` and schedule `fn` again, remembering this call's `this` and `args`.
3. Use a regular `function` for the returned wrapper so it receives the caller's `this`, and an arrow inside `setTimeout` so that `this` carries through.
4. `cancel` clears the timer.

## Walkthrough

`const save = debounce(write, 300)`:

| Time (ms) | Event | Timer | `write` runs? |
| --- | --- | --- | --- |
| 0 | `save('a')` | set for 300 | no |
| 100 | `save('ab')` | cleared, reset for 400 | no |
| 250 | `save('abc')` | cleared, reset for 550 | no |
| 550 | timer fires | – | yes, with `'abc'` and the last caller's `this` |
| 600 | `save('abcd')` | set for 900 | no |
| 700 | `save.cancel()` | cleared | never for `'abcd'` |

Only the **last** call in a burst runs, `wait` ms after the burst goes quiet.

## Complexity

`O(1)` per call: clearing and setting one timer.

## Edge cases to test

- A single call runs once after `wait`.
- A burst of calls runs once with the last arguments.
- `this` and arguments come from the last call.
- `cancel()` drops a pending call; the next call starts fresh.
- Two separate bursts produce two runs.
- Use fake timers (`vi.useFakeTimers()`) to control time in tests.

## Pitfalls

- Returning an arrow function from `debounce` loses the caller's `this`.
- Calling `fn(...args)` instead of `fn.apply(this, args)` breaks methods.
- Forgetting that `clearTimeout(undefined)` is harmless; no need to guard it.

## Follow-ups interviewers add

- **Leading edge:** call immediately on the first call of a burst, then ignore calls until the wait passes (`{ leading: true, trailing: false }`).
- **`flush()`:** run the pending call right now.
- **`maxWait`:** guarantee a call at least every N ms during a long burst; this is how lodash's `throttle` is built on `debounce`.
- **Return value:** return a promise that resolves with `fn`'s result when it finally runs.

## In the interview

Draw the timeline before coding. Say why the wrapper must be a regular `function` (to capture `this`), why state lives in the closure, and offer `leading`, `flush` and `maxWait` as extensions.
