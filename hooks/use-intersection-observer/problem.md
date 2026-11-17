---
title: useIntersectionObserver
difficulty: Medium
order: 18
tags: [IntersectionObserver, useEffect, lazy-loading]
frequency: medium
hook: useIntersectionObserver
hints:
  - Create the observer inside an effect, `observe(ref.current)`, and `disconnect()` in the cleanup.
  - Callers pass a fresh options object on every render. Key the effect on the option *values* (a threshold array can be joined into a string), not on the object.
  - For `once`, disconnect inside the callback as soon as an entry is intersecting, and don't observe again after that.
---

Implement `useIntersectionObserver(ref, options)`. It watches the element in `ref` with an `IntersectionObserver` and returns `{ isIntersecting, entry }`, where `entry` is the latest `IntersectionObserverEntry` (or `undefined` before the first one).

`options` is `{ root, rootMargin, threshold, once }`. The first three are passed to the `IntersectionObserver` constructor. With `once: true`, the hook stops observing the first time the element becomes visible and stays `true` (useful for lazy loading and "seen" analytics).

```jsx
function LazyImage({ src, alt }) {
  const ref = useRef(null)
  const { isIntersecting } = useIntersectionObserver(ref, { rootMargin: '200px', once: true })
  return <img ref={ref} src={isIntersecting ? src : undefined} alt={alt} />
}
```

Requirements:

- Pass `root`, `rootMargin` and `threshold` to the observer and observe `ref.current`. If `ref.current` is `null`, create nothing.
- Re-renders with an equal options object (a new object with the same values) must **not** recreate the observer. Changing a value does: disconnect the old one, create a new one.
- Disconnect on unmount.
