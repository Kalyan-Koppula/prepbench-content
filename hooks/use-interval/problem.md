---
title: useInterval
difficulty: Medium
order: 6
tags: [useEffect, useRef, timers, stale-closures]
frequency: high
hook: useInterval
hints:
  - The interval should only be created or destroyed when `delay` changes, not when `callback` changes.
  - Keep the latest callback in a ref, updated in an effect, and have the interval call `ref.current()`.
  - A `null` delay means "don't schedule anything"; the effect's cleanup clears the interval.
---

Implement `useInterval(callback, delay)`. It calls `callback` every `delay` milliseconds while the component is mounted.

```jsx
function Stopwatch() {
  const [running, setRunning] = useState(true)
  const [seconds, setSeconds] = useState(0)
  useInterval(() => setSeconds(seconds + 1), running ? 1000 : null)
  return <button onClick={() => setRunning(!running)}>{seconds}s</button>
}
```

Requirements:

- Each tick calls the **latest** `callback`, so it sees current props and state (`seconds + 1` above must keep counting).
- A new `callback` on every render must **not** restart the timer. A component that re-renders more often than `delay` must still tick.
- `delay === null` pauses: nothing is scheduled. Setting a number again resumes.
- Changing `delay` restarts the interval with the new delay.
- Unmounting clears the interval.
