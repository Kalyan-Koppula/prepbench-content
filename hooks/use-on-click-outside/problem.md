---
title: useOnClickOutside
difficulty: Medium
order: 9
tags: [useEffect, refs, events, dom]
frequency: high
hook: useOnClickOutside
hints:
  - Listen on `document` for `mousedown` and `touchstart`, then check `element.contains(event.target)`.
  - Normalise the argument to an array of refs; the press is "inside" if any of them contains the target.
  - Call the handler through a ref so a new inline handler doesn't re-subscribe, and remove both listeners in the cleanup.
---

Implement `useOnClickOutside(refs, handler)`. It calls `handler(event)` when the user presses the mouse or touches anywhere **outside** the referenced element(s).

```jsx
function Menu() {
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  const panel = useRef(null)
  useOnClickOutside([button, panel], () => setOpen(false))
  return (
    <>
      <button ref={button} onClick={() => setOpen((o) => !o)}>Menu</button>
      {open && <ul ref={panel}>...</ul>}
    </>
  )
}
```

Requirements:

- `refs` is one ref or an array of refs. A press inside any of them, or inside any of their descendants, is not "outside".
- Use `mousedown` and `touchstart` on `document` (so a drag that starts inside and ends outside doesn't close the menu).
- Refs whose `current` is `null` (not rendered) are ignored. If none of them is rendered, don't call the handler.
- Always call the latest `handler`. Remove the listeners on unmount.
