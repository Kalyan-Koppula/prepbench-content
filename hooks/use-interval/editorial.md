**Key insight:** separate *what to run* from *when to run it*. The callback lives in a ref that is refreshed every render; the interval's lifetime depends only on `delay`.

## Approach

`const saved = useRef(callback)` plus an effect that assigns `saved.current = callback` whenever it changes. A second effect keyed on `[delay]` returns early for `null`, otherwise starts `setInterval(() => saved.current(), delay)` and returns `() => clearInterval(id)`. Because the interval only ever calls through the ref, it always runs the newest closure, and an inline arrow function passed on every render never resets the timer. Changing `delay` runs the cleanup and starts a fresh interval; unmounting runs the cleanup.

## Walkthrough

```jsx
function Clock() {
  const [now, setNow] = useState(Date.now())
  const [paused, setPaused] = useState(false)
  useInterval(() => setNow(Date.now()), paused ? null : 1000)
}
```

| Change | What happens |
| --- | --- |
| Every render | `saved.current` gets the newest callback (no stale closures) |
| `delay` stays 1000 | the interval keeps running; it is **not** reset by re-renders |
| `delay` becomes `null` | the effect cleanup clears the interval: paused |
| `delay` becomes 1000 again | a new interval starts |

Separating "which callback" (a ref, updated every render) from "when to tick" (the effect, keyed on `delay`) is what makes the hook both fresh and stable.

## What to test

- The callback runs every `delay` ms.
- Changing the callback doesn't restart the interval.
- `null` pauses; a new delay restarts.
- Unmount clears the interval.

## Pitfalls

- `useEffect(() => { const id = setInterval(callback, delay); ... }, [])`: the interval keeps the first render's callback, so `setN(n + 1)` sets `1` forever.
- Adding `callback` to the dependency list fixes staleness but restarts the timer on every render. A component that re-renders more often than `delay` (typing, animations, its own ticks with a long delay) then never ticks at all.
- Forgetting the cleanup leaks intervals on every delay change and keeps firing after unmount.
- Treating `0` as "paused" with `if (!delay)`.

## Follow-ups

- Return `{ start, stop }` controls, or an `immediate` option that also fires on mount.
- Why update the ref in an effect (or `useLayoutEffect`) rather than during render?
- `useAnimationFrame(callback)`: the same ref trick with `requestAnimationFrame`.

## In the interview

This is the canonical example of the stale-closure problem with `setInterval` in effects, popularised by Dan Abramov's "Making setInterval declarative" article. Explain the ref split.
