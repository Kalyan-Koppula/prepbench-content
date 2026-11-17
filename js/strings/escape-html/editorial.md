**Key insight:** both directions are a single regex pass with a lookup in the callback. One pass is what makes the functions correct: chained `replace` calls re-process their own output, which double-escapes or double-decodes.

## Approach

- **Escape:** `text.replace(/[&<>"']/g, ch => MAP[ch])`.
- **Unescape:** one regex with three alternatives, `&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));`.
  - Named match: look it up with an own-property check; unknown names return the original match.
  - Numeric match: parse with base 10 or 16; if the code point is in range and not a surrogate, return `String.fromCodePoint(code)`; otherwise return the match.

## Pitfalls

- `.replace(/</g, '&lt;').replace(/&/g, '&amp;')`: escaping `&` *after* `<` turns `&lt;` into `&amp;lt;`.
- `.replace(/&amp;/g, '&').replace(/&lt;/g, '<')` when unescaping: `&amp;lt;` decodes twice into `<`, which is how a double-decoding XSS slips through.
- `String.fromCharCode` for code points above `0xFFFF`: emoji come out as garbage.
- `String.fromCodePoint(0x110000)` throws a `RangeError`; validate first.
- `NAMED[name]` without an own-property check returns functions for `&constructor;`.

## Follow-ups interviewers add

- **Use the DOM:** `textContent` then read `innerHTML`, or `DOMParser` to decode, and why that is unsafe on untrusted input in some contexts.
- **Context matters:** escaping for attributes without quotes, URLs (`javascript:`), inline `<script>` and CSS are all different.
- **Tagged template:** `` html`<p>${userInput}</p>` `` that escapes every interpolation automatically.
- **Full entity table:** HTML has over 2,000 named references; how would you load them lazily?
