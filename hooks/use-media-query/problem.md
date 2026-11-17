---
title: useMediaQuery
difficulty: Medium
order: 10
tags: [useEffect, matchMedia, subscriptions]
frequency: medium
hook: useMediaQuery
hints:
  - Read `window.matchMedia(query).matches` in a lazy `useState` initialiser so the first render is already right.
  - In an effect keyed on `query`, keep the `MediaQueryList` object and subscribe to its `change` event.
  - Unsubscribe from that *same* `MediaQueryList` in the cleanup, and re-sync the state when the query changes.
---

Implement `useMediaQuery(query)`. It returns `true` while the CSS media query matches and re-renders when that changes.

```jsx
function Layout({ children }) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  return <div className={prefersDark ? 'dark' : 'light'}>{isMobile ? <Drawer /> : <Sidebar />}{children}</div>
}
```

Requirements:

- The **first** render returns the real answer. Rendering `false` and then correcting it in an effect makes the layout flash.
- Listen with `addEventListener('change', ...)` on the `MediaQueryList` returned by `window.matchMedia(query)`.
- When `query` changes, return the new query's answer and stop listening to the old one.
- Remove the listener on unmount.
