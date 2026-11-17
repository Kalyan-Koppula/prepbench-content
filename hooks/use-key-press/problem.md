---
title: useKeyPress
difficulty: Medium
order: 20
tags: [events, keyboard, useRef, parsing]
frequency: medium
hook: useKeyPress
hints:
  - Parse a combo like `"ctrl+shift+k"` once into `{ key, ctrl, shift, alt, meta }`. The last part is the key, the rest are modifiers.
  - A combo matches when the key matches (ignoring case) and *each* of the four modifier flags equals what the combo asks for, so extra modifiers block a match.
  - Skip events whose target is an `input`, `textarea` or `select` unless `enableInInputs` is set, and call the handler through a ref.
---

Implement `useKeyPress(combo, handler, options)` for keyboard shortcuts. It listens for `keydown` on `window` and calls `handler(event)` when the pressed keys match `combo`.

- `combo` is a string such as `'Escape'`, `'/'`, `'ctrl+k'` or `'meta+shift+p'`, or an array of them (any one matches). Modifier names are `ctrl`, `alt`, `shift` and `meta`. The last part is compared with `event.key`, ignoring case.
- `options` is `{ preventDefault = false, enableInInputs = false }`.

```jsx
function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  useKeyPress(['meta+k', 'ctrl+k'], () => setPaletteOpen(true), { preventDefault: true })
  useKeyPress('Escape', () => setPaletteOpen(false), { enableInInputs: true })
  return paletteOpen ? <CommandPalette /> : <Main />
}
```

Requirements:

- Modifiers must match **exactly**: `'ctrl+k'` fires for Ctrl+K but not for plain K or Ctrl+Shift+K.
- By default, ignore key presses while the user is typing in an `input`, `textarea` or `select`. `enableInInputs: true` turns that off.
- With `preventDefault: true`, call `event.preventDefault()` on a match (to stop the browser's own Ctrl+K, for example).
- Always call the latest `handler` without re-subscribing, and remove the listener on unmount.
