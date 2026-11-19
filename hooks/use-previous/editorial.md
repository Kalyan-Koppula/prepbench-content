**Key insight:** "previous" should mean *the value before the last change*, so you shift the stored pair only when the value is different, and you do it during render so the answer is never a render late.

## Approach

Keep `{ current, previous }` in one piece of state. On each render compare the incoming `value` with `current` using `Object.is`. If it changed, call `setTrack({ current: value, previous: track.current })` right there in the render body. React allows a component to update its *own* state during render: it throws away the output and re-renders straight away, before anything is committed. If nothing changed, return `previous`.

## Walkthrough

Rendering with values `1`, `1`, `2`, `3`:

| Render | `value` | Stored `{ current, previous }` | Returned |
| --- | --- | --- | --- |
| 1 | 1 | `{ 1, undefined }` | `undefined` |
| 2 | 1 | unchanged | `undefined` |
| 3 | 2 | update to `{ 2, 1 }` during render | 1 |
| 4 | 3 | update to `{ 3, 2 }` | 2 |

This version tracks the previous **distinct value**. Updating state during render (when the value changed) is an officially supported React pattern for deriving state from props. The common `useRef` + `useEffect` version instead returns the value from the previous **render**, which differs when unrelated state causes a re-render.

## What to test

- The first render returns `undefined`.
- Re-rendering with the same value keeps the previous one.
- Each change shifts current to previous.
- `NaN` compared with `Object.is` doesn't loop.

## Pitfalls

- The widely copied `useRef` + `useEffect` version (`ref.current = value` in an effect) returns "the value from the last *render*", so any unrelated re-render makes `previous === value` and the trend arrow disappears.
- Writing a ref during render (`if (ref.value !== value) ref.prev = ...`) works in simple cases but is impure; under concurrent rendering a discarded render can still mutate it.
- Using `!==` instead of `Object.is` makes `NaN` look like it changed on every render.

## Follow-ups

- Accept a custom `isEqual(a, b)` so objects can be compared by content.
- `useHistory(value, size)`: keep the last N distinct values.
- Why doesn't React ship this? (It is easy to misuse for effects; usually you can compare inside an event handler instead.)

## In the interview

Clarify which semantics are wanted (previous render versus previous different value), since the two common implementations differ exactly there.
