---
title: useCounter
difficulty: Easy
order: 4
tags: [useState, functional-updates, clamping]
frequency: medium
hook: useCounter
hints:
  - Write one `clamp(n)` helper and send every new value through it, including the initial one.
  - Use functional updates so several increments in one event all count.
  - The bounds can change between renders; make sure the helpers read the current ones.
---

Implement `useCounter(initial = 0, { min, max, step = 1 } = {})`. It returns `{ count, increment, decrement, set, reset }`.

```jsx
function Quantity() {
  const { count, increment, decrement } = useCounter(1, { min: 1, max: 10 })
  return (
    <>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </>
  )
}
```

Requirements:

- `increment()` / `decrement()` move by `step`. `set(n)` jumps to `n`. `reset()` goes back to `initial`.
- The count never leaves `[min, max]`: every value, including `initial` and anything passed to `set`, is clamped. Either bound may be omitted.
- Calling `increment()` three times in one event adds `3 * step`.
- If `min`, `max` or `step` change on a later render, the helpers use the new values.
