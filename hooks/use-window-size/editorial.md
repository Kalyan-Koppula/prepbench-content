**Key insight:** store the size in state, subscribe once, and bail out of updates that don't change anything, so the hook costs nothing when the window isn't actually changing size.

## Approach

`useState(measure)` with a lazy initialiser reads `innerWidth`/`innerHeight` for the first render. An effect with `[]` defines `onResize`, which measures and calls `setSize(prev => same ? prev : next)`. Returning `prev` keeps the object identity and lets React skip the render entirely. The effect calls `onResize()` once, in case the window changed between render and subscribing, and its cleanup removes the listener.

## Walkthrough

| Event | Effect |
| --- | --- |
| first render | measures `innerWidth`/`innerHeight` |
| mount | subscribes to `resize` and measures again (in case it changed between render and subscribe) |
| resize to the same size | returns the previous object, so no re-render |
| unmount | removes the listener |

Returning the same object when nothing changed matters: components comparing it in dependencies or `memo` don't re-render on redundant events.

## What to test

- Initial size.
- Updates on resize.
- Same-size events don't change identity.
- Cleanup on unmount.

## Pitfalls

- Returning `{ width: window.innerWidth, height: window.innerHeight }` straight from render: a new object every render breaks `useEffect` deps and `memo`, and it never re-renders on resize anyway.
- `setSize(measure())` always creates a new object, so every `resize` event re-renders even when nothing changed. During a drag that is dozens of times a second.
- Adding and removing with different function references (e.g. an inline arrow in both places) leaks the listener.

## Follow-ups

- Throttle with `requestAnimationFrame` so a drag resize renders at most once per frame.
- Use `ResizeObserver` for an *element's* size instead of the window's (`useElementSize(ref)`).
- SSR: what do you return when `window` is undefined?

## In the interview

Mention throttling resize handling for expensive consumers, `ResizeObserver` for element sizes (usually what layouts actually need), and SSR defaults.
