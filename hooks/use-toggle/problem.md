---
title: useToggle
difficulty: Easy
order: 3
tags: [useState, useCallback, functional-updates]
frequency: high
hook: useToggle
hints:
  - Use the functional form of the setter so two toggles in a row both count.
  - An event handler receives the event object; only treat a real boolean argument as "set to this".
  - Wrap the toggler in `useCallback` with no dependencies so its identity never changes.
---

Implement `useToggle(initial = false)`. It returns `[on, toggle]`.

- `toggle()` flips the value.
- `toggle(true)` / `toggle(false)` sets it explicitly.

```jsx
function Spoiler({ text }) {
  const [open, toggle] = useToggle()
  return (
    <>
      <button onClick={toggle}>{open ? 'Hide' : 'Show'}</button>
      {open && <p>{text}</p>}
      <button onClick={() => toggle(false)}>Close</button>
    </>
  )
}
```

Requirements:

- `toggle` can be passed straight to `onClick`. The click event it receives is not a boolean, so it must flip.
- Calling `toggle()` twice in the same event flips twice (back to where it started).
- `toggle` keeps the same identity across renders, so memoised children don't re-render.
