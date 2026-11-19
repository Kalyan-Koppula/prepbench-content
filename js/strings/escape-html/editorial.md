**Key insight:** both directions are a single regex pass with a lookup in the callback. One pass is what makes the functions correct: chained `replace` calls re-process their own output, which double-escapes or double-decodes.

## Approach

- **Escape:** `text.replace(/[&<>"']/g, ch => MAP[ch])`.
- **Unescape:** one regex with three alternatives, `&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));`.
  - Named match: look it up with an own-property check; unknown names return the original match.
  - Numeric match: parse with base 10 or 16; if the code point is in range and not a surrogate, return `String.fromCodePoint(code)`; otherwise return the match.

## Walkthrough

`escapeHtml('<a href="x">Tom & Jerry\'s</a>')`:

| Character | Becomes |
| --- | --- |
| `<`, `>` | `&lt;`, `&gt;` |
| `"` | `&quot;` |
| `&` | `&amp;` |
| `'` | `&#39;` |

Result: `&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;`. A single `replace` with a character class guarantees `&` is never double-escaped (a sequence of separate replacements must do `&` first). `unescapeHtml` reverses named, decimal and hex entities and leaves invalid ones untouched.

## Complexity

`O(n)`.

## Edge cases to test

- All five special characters.
- No double escaping (`&amp;` stays `&amp;amp;` only if escaped twice deliberately).
- Round trip: `unescapeHtml(escapeHtml(s)) === s`.
- Numeric entities, including emoji above `U+FFFF`.
- Unknown entities left as they are.

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

## In the interview

Point out the context problem: escaping for HTML text isn't enough inside attributes without quotes, URLs (`javascript:`), or `<script>`. In real apps, frameworks escape by default and `textContent` avoids the issue entirely.
