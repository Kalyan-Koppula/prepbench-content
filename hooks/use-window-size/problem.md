---
title: useWindowSize
difficulty: Easy
order: 11
tags: [useEffect, events, resize]
frequency: medium
hook: useWindowSize
hints:
  - Initialise state from `window.innerWidth` / `window.innerHeight` so the first render is correct.
  - Subscribe to `resize` on `window` in an effect and remove the same function in the cleanup.
  - In the setter, return the previous object when nothing changed; React then skips the re-render.
---

Implement `useWindowSize()`. It returns `{ width, height }` (the window's `innerWidth` and `innerHeight`) and updates when the window is resized.

```jsx
function Gallery({ photos }) {
  const { width } = useWindowSize()
  const columns = width < 600 ? 1 : width < 1000 ? 2 : 4
  return <Grid columns={columns} items={photos} />
}
```

Requirements:

- The first render already has the real size.
- Re-renders that aren't caused by a resize return the **same object**, so it is safe in dependency arrays and `memo` props.
- A `resize` event that doesn't change the size (it happens, e.g. when the browser zooms, or several listeners fire) must not re-render the component.
- Remove the listener on unmount.
