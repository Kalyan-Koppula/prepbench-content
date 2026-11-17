---
title: useTimeout
difficulty: Medium
order: 7
tags: [useEffect, useRef, timers, cleanup]
frequency: medium
hook: useTimeout
hints:
  - Keep the latest callback in a ref so a new callback never moves the deadline.
  - Store the timer id in a ref too; `clear` cancels it and `reset` is "clear, then schedule again".
  - An effect keyed on `delay` schedules on mount and its cleanup clears on unmount.
---

Implement `useTimeout(callback, delay)`. It calls `callback` once, `delay` ms after mount, and returns `{ reset, clear }`.

```jsx
function Toast({ message, onDismiss }) {
  const { reset, clear } = useTimeout(onDismiss, 3000)
  return (
    <div onMouseEnter={clear} onMouseLeave={reset}>
      {message}
    </div>
  )
}
```

Requirements:

- `clear()` cancels the pending call. `reset()` cancels it and starts a full `delay` countdown again, which also works after the timeout has already fired.
- When the timeout fires it calls the **latest** `callback`. Passing a new callback (e.g. an inline arrow on every render) does not restart the countdown.
- `delay === null` schedules nothing. Changing `delay` starts a new countdown.
- Unmounting cancels the pending call.
