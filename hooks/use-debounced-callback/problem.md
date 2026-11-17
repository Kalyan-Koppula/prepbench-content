---
title: useDebouncedCallback
difficulty: Medium
order: 14
tags: [useRef, timers, stale-closures, cleanup]
frequency: high
hook: useDebouncedCallback
hints:
  - Create the debounced function exactly once (a lazy `useState` initialiser or a ref) so its identity never changes.
  - Have it call `fnRef.current`, updated after every render, so it always runs the newest `fn` with current props and state.
  - Keep the timer id and the pending arguments in refs so `cancel`, `flush` and the unmount cleanup can reach them.
---

Implement `useDebouncedCallback(fn, delay)`. It returns a debounced version of `fn`: calling it schedules `fn` for `delay` ms later, and each new call restarts the wait. The returned function also has `cancel()` and `flush()`.

```jsx
function NoteEditor({ noteId }) {
  const [text, setText] = useState('')
  const save = useDebouncedCallback((value) => api.save(noteId, value), 500)
  return (
    <>
      <textarea value={text} onChange={(e) => { setText(e.target.value); save(e.target.value) }} />
      <button onClick={save.flush}>Save now</button>
    </>
  )
}
```

Requirements:

- `fn` runs once, with the arguments of the **last** call, after calls stop for `delay` ms.
- The returned function keeps the **same identity** for the component's lifetime, even when `fn` is a new inline arrow on every render.
- When it fires, it runs the **latest** `fn` (here, with the current `noteId`).
- `cancel()` drops the pending call. `flush()` runs a pending call immediately and does nothing if none is pending.
- Unmounting cancels a pending call.
