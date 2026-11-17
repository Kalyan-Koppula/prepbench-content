**Key insight:** "previous" should mean *the value before the last change*, so you shift the stored pair only when the value is different, and you do it during render so the answer is never a render late.

## Approach

Keep `{ current, previous }` in one piece of state. On each render compare the incoming `value` with `current` using `Object.is`. If it changed, call `setTrack({ current: value, previous: track.current })` right there in the render body. React allows a component to update its *own* state during render: it throws away the output and re-renders straight away, before anything is committed. If nothing changed, return `previous`.

## Pitfalls

- The widely copied `useRef` + `useEffect` version (`ref.current = value` in an effect) returns "the value from the last *render*", so any unrelated re-render makes `previous === value` and the trend arrow disappears.
- Writing a ref during render (`if (ref.value !== value) ref.prev = ...`) works in simple cases but is impure; under concurrent rendering a discarded render can still mutate it.
- Using `!==` instead of `Object.is` makes `NaN` look like it changed on every render.

## Follow-ups

- Accept a custom `isEqual(a, b)` so objects can be compared by content.
- `useHistory(value, size)`: keep the last N distinct values.
- Why doesn't React ship this? (It is easy to misuse for effects; usually you can compare inside an event handler instead.)
