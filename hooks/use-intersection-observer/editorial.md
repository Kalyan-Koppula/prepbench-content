**Key insight:** the observer is a subscription. Build it in an effect, tear it down in the cleanup, and key the effect on *values* so inline option objects don't churn it.

## Approach

Destructure the options with defaults and turn `threshold` (a number or an array) into a string key. The effect reads `ref.current`, returns early if it's missing (or if `once` already fired), creates `new IntersectionObserver(callback, { root, rootMargin, threshold })`, observes the element, and returns `() => observer.disconnect()`. The callback stores the latest entry in state; with `once`, it also disconnects as soon as an entry is intersecting and sets a ref so later renders don't observe again. `isIntersecting` is derived from the stored entry.

## Pitfalls

- `useEffect(..., [ref, options])` with `options` written inline: a new object every render means a new observer every render, and a render triggered by the observer's own callback becomes a loop.
- Forgetting `disconnect()`: observers keep the element alive and keep calling `setState` after unmount.
- Reading `ref.current` during render instead of in the effect (it's `null` on the first render).
- Using `entries[0]`: when several changes are batched, the *last* entry is the current state.
- With `once`, observing again on the next render undoes the whole point (the image flickers back to the placeholder).

## Follow-ups

- Accept a callback ref so it works for elements that mount later.
- Share one observer across many elements (a list of 1,000 lazy images) with a `Map<Element, callback>`.
- Infinite scroll: observe a sentinel at the end of the list and call `loadMore`.
