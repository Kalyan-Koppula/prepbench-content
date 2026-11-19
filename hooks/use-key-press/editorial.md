**Key insight:** a shortcut is a *spec* (`{ key, ctrl, alt, shift, meta }`) compared field by field with the event. Parse once, compare exactly, and keep the handler in a ref.

## Approach

Normalise `combo` to an array and join it into a string key so an inline array doesn't resubscribe on every render. Inside the effect, parse each combo: split on `+`, lower-case, the last part is the key and the rest set modifier flags. The `keydown` listener on `window` returns early for events from form fields (unless `enableInInputs`), checks whether any spec matches, meaning the key equals `event.key.toLowerCase()` and all four modifier flags are *equal* to the event's, then optionally calls `preventDefault()` and finally `saved.current(event)`. The cleanup removes the same listener.

## Walkthrough

`useKeyPress('ctrl+k', openSearch)` and `useKeyPress('shift++', zoomIn)`:

| Combo | Parsed | Matches |
| --- | --- | --- |
| `ctrl+k` | key `k`, ctrl | Ctrl and K, with no other modifiers |
| `shift++` | key `+`, shift | the plus key with Shift (the trailing `++` means "the `+` key") |
| `escape` | key `escape` | Escape with no modifiers |

Modifiers are matched **exactly**, so `ctrl+k` doesn't fire for Ctrl+Shift+K. Keys are compared using `event.key` in lower case.

## What to test

- Single keys, modifier combinations, the `+` key itself.
- Extra modifiers don't match.
- Events from inputs and textareas (often ignored for global shortcuts).
- Cleanup on unmount.

## Pitfalls

- Checking only that the required modifiers are down (`if (spec.ctrl && !e.ctrlKey) return`) lets `ctrl+k` fire for Ctrl+Shift+K, which is usually a different shortcut.
- Comparing `event.key` case-sensitively: with Shift held the key is `'P'`, not `'p'`.
- Using `event.keyCode` / `which`: deprecated. `event.code` (`'KeyK'`) is layout-independent, which is good for games and wrong for letter shortcuts on non-QWERTY layouts.
- Hijacking `/` or `?` while the user is typing in a search box.
- `combo.split('+')` breaks for the plus key itself (`'ctrl++'`); handle the trailing `+`.
- Shift changes the character for symbols: on US layouts Shift+/ is `'?'`, so the combo for "?" is `'shift+?'` with exact matching, or `'?'` if you ignore Shift for symbols.

## Follow-ups

- A `mod` alias that means Meta on macOS and Ctrl elsewhere.
- Sequences like `g` then `i` (GitHub-style), with a timeout between keys.
- Return a `pressed` boolean that tracks keydown/keyup, and reset it on `blur` (a keyup that happens in another window never arrives).

## In the interview

Discuss `event.key` versus `event.code` (layout-dependent characters versus physical keys), macOS Cmd versus Ctrl, and not stealing shortcuts while the user is typing in a field.
