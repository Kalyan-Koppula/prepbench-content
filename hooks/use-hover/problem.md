---
title: useHover
difficulty: Medium
order: 12
tags: [callback-refs, events, useState]
frequency: medium
hook: useHover
hints:
  - A `useRef` object won't tell you when the element mounts or changes. A callback ref (a function) is called with the node, and with `null` when it goes away.
  - In the callback ref, detach listeners from the previous node before attaching `mouseenter` / `mouseleave` to the new one.
  - Reset `hovered` to `false` whenever the node changes, because a removed element never fires `mouseleave`.
---

Implement `useHover()`. It returns `[ref, hovered]`: attach `ref` to any element and `hovered` is `true` while the pointer is over it.

```jsx
function Avatar({ user }) {
  const [ref, hovered] = useHover()
  return (
    <div ref={ref}>
      <img src={user.photo} alt="" />
      {hovered && <Tooltip>{user.name}</Tooltip>}
    </div>
  )
}
```

Requirements:

- Use `mouseenter` / `mouseleave`, which don't fire again when moving between child elements.
- The element may appear after the first render (conditional rendering) or be swapped for a different element. The hook must follow it.
- When the element is removed or replaced, `hovered` goes back to `false`.
- Listeners are removed from old elements and on unmount.
