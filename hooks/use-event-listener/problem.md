---
title: useEventListener
difficulty: Medium
order: 8
tags: [useEffect, useRef, events, cleanup]
frequency: high
hook: useEventListener
hints:
  - Resolve the target inside the effect - a ref's `.current` is only filled in after the commit.
  - Subscribe a small wrapper that calls `handlerRef.current(event)`, so a new handler never forces a re-subscribe.
  - '`removeEventListener` only matches if you pass the same function and the same `capture` flag you added with.'
---

Implement `useEventListener(eventName, handler, target, options)`.

- `target` can be a ref (`{ current: element }`), an element, `document` or `window`. If it is omitted, listen on `window`.
- `options` is the usual `addEventListener` options object (`capture`, `passive`, `once`).

```jsx
function Modal({ onClose }) {
  const panel = useRef(null)
  useEventListener('keydown', (e) => e.key === 'Escape' && onClose(), document)
  useEventListener('scroll', () => console.log('panel scrolled'), panel, { passive: true })
  return <div ref={panel}>...</div>
}
```

Requirements:

- When the handler changes on a later render, the new one is called and the listener is **not** removed and re-added.
- Changing `eventName` or `target` moves the listener: the old one is removed and a new one is added.
- Unmounting removes the listener. A listener added with `capture: true` must be removed with it too.
- If a ref's `current` is `null`, do nothing.
