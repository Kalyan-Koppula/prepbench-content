---
title: useThrottledValue
difficulty: Medium
order: 15
tags: [useEffect, useRef, timers, throttle]
frequency: medium
hook: useThrottledValue
hints:
  - Remember *when* the shown value last changed in a ref (mount counts as a change).
  - In an effect on `[value, interval]`, compare the time elapsed with `interval` - show immediately if enough time has passed, otherwise schedule for the remaining time.
  - The effect's cleanup clears a scheduled update, so a newer value replaces it and only the latest one is ever shown.
---

Implement `useThrottledValue(value, interval)`. It returns `value`, but the returned value changes **at most once every `interval` ms**. Unlike a debounced value, it keeps updating while `value` keeps changing.

```jsx
function ScrollProgress() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = () => setY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const shownY = useThrottledValue(y, 100) // expensive chart re-renders ≤ 10×/s
  return <ExpensiveChart position={shownY} />
}
```

Requirements:

- The first render returns `value` as is. Mount counts as the last change.
- When `value` changes and at least `interval` ms have passed since the shown value last changed, show it **immediately** (leading edge).
- Otherwise show it when the interval is up (trailing edge). If several values arrive in the meantime, only the latest is shown. The final value is never lost.
- Unmounting cancels a scheduled update.
