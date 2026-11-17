---
title: Throttle
difficulty: Medium
order: 3
tags: [timers, closures, this]
frequency: high
exports: [throttle]
hints:
  - The first call runs right away and opens a window of `wait` ms. What should happen to calls that land inside that window?
  - Keep only the latest call made during the window (its `this` and arguments). When the window closes, run it if there is one.
  - Running that saved call is itself a run, so it must open a fresh window; if nothing was saved, the window simply closes.
---

Implement `throttle(fn, wait)`. The returned function runs `fn` **at most once every `wait` milliseconds**, no matter how often it is called.

- A call made when no window is open runs `fn` immediately and opens a window of `wait` ms.
- Calls made while the window is open don't run. The **latest** of them is remembered and runs when the window closes; that run opens a new window.
- If nothing was called during the window, it just closes, and the next call runs immediately again.

```js
const onScroll = throttle(() => console.log('scroll', window.scrollY), 100)
// scroll events every 16ms for one second → about 10 logs, roughly 100ms apart,
// and the final scroll position is always reported
```

## Notes

- `fn` receives the `this` and arguments of the call that is being run.
- A burst of exactly one call runs `fn` once, not twice.
- You don't need to return `fn`'s result. `throttle-advanced` adds options, `cancel` and return values.
