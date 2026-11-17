**Key insight:** store the size in state, subscribe once, and bail out of updates that don't change anything, so the hook costs nothing when the window isn't actually changing size.

## Approach

`useState(measure)` with a lazy initialiser reads `innerWidth`/`innerHeight` for the first render. An effect with `[]` defines `onResize`, which measures and calls `setSize(prev => same ? prev : next)`. Returning `prev` keeps the object identity and lets React skip the render entirely. The effect calls `onResize()` once, in case the window changed between render and subscribing, and its cleanup removes the listener.

## Pitfalls

- Returning `{ width: window.innerWidth, height: window.innerHeight }` straight from render: a new object every render breaks `useEffect` deps and `memo`, and it never re-renders on resize anyway.
- `setSize(measure())` always creates a new object, so every `resize` event re-renders even when nothing changed. During a drag that is dozens of times a second.
- Adding and removing with different function references (e.g. an inline arrow in both places) leaks the listener.

## Follow-ups

- Throttle with `requestAnimationFrame` so a drag resize renders at most once per frame.
- Use `ResizeObserver` for an *element's* size instead of the window's (`useElementSize(ref)`).
- SSR: what do you return when `window` is undefined?
