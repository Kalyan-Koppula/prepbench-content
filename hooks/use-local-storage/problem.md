---
title: useLocalStorage
difficulty: Medium
order: 5
tags: [useState, useEffect, localStorage, events]
frequency: high
hook: useLocalStorage
hints:
  - Read storage once, lazily, in the `useState` initialiser, and wrap `JSON.parse` in try/catch.
  - Browsers fire `storage` only in *other* tabs. To reach other hook instances in this tab, keep a module-level `Set` of subscriber functions and call them after writing.
  - Every instance also listens for `storage` on `window` (cleaning up on unmount) and parses `event.newValue` when the event's key matches; `newValue === null` means the key was removed.
---

Implement `useLocalStorage(key, initialValue)`. It works like `useState`, but the value is saved to `localStorage` as JSON and shared by every component using the same key.

```jsx
function ThemeSwitch() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  return <button onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>{theme}</button>
}
function Header() {
  const [theme] = useLocalStorage('theme', 'light') // updates when ThemeSwitch changes it
  return <header className={theme}>...</header>
}
```

Requirements:

- On mount, use the stored value if there is one, otherwise `initialValue`. A stored value that isn't valid JSON falls back to `initialValue` instead of crashing.
- `setValue` takes a value or an updater function `(prev) => next`, writes `JSON.stringify(next)` to storage and updates the state. Several updater calls in one event all apply.
- Every hook instance with the same key updates when any of them sets the value. (The browser's `storage` event never fires in the tab that made the change, so you need your own way to tell same-tab instances.)
- Changes made in another tab (a `storage` event on `window` for this key) are picked up too. If the key was removed (`newValue === null`), go back to `initialValue`.
- Remove the listener (and any subscription) on unmount.
