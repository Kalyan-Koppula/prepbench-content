---
title: Throttle with options and cancel
difficulty: Hard
order: 4
tags: [timers, closures, this]
frequency: medium
exports: [throttle]
hints:
  - Every window starts with a call made while no window is open. The only thing `leading` changes is whether that first call runs now or is saved for the end of the window.
  - At the end of a window, run the saved call only when `trailing` is on; that run opens the next window. Otherwise the window just closes.
  - "`cancel()` must clear the timer, forget the saved call and close the window, so the next call starts fresh."
---

Implement `throttle(fn, wait, options)` with an optional `options` object:

| Option | Default | Meaning |
|---|---|---|
| `leading` | `true` | The call that opens a window runs `fn` immediately. |
| `trailing` | `true` | When a window closes, run the latest call made during it (if any). |

The rules:

- A call made while no window is open **opens a window** of `wait` ms. With `leading: true` it runs now; with `leading: false` it is saved instead.
- A call made while a window is open replaces the saved call.
- When the window closes: if `trailing` is on and a call is saved, run it and open a new window right away (that run counts as the new window's first run). Otherwise the window closes and the saved call, if any, is dropped.

The returned function returns the result of the most recent run of `fn` (`undefined` before the first run), and has a `cancel()` method that drops the saved call and closes the window.

```js
const track = throttle(sendPosition, 1000, { leading: false })
track(p1)   // nothing yet
track(p2)   // 1s after the first call: sendPosition(p2)

const click = throttle(submit, 2000, { trailing: false })
click(); click(); click()  // submit runs once; extra clicks inside 2s are ignored
```

## Notes

- `fn` gets the `this` and arguments of the call being run.
- You can assume `leading` and `trailing` are not both `false`.
- With `trailing: false` the window is measured from the run that opened it; ignored calls don't extend it.
