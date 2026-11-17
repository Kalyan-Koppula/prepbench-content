**Key insight:** most of the work is in the small rules: split on the *first* `=`, replace `+` *before* percent-decoding, and never let a decode error throw. The repeated-key logic is a three-state upgrade: absent, string, array.

## Approach

1. Strip one leading `?`, split on `&`, skip empty pieces.
2. `eq = piece.indexOf('=')`; key is everything before it (or the whole piece), value everything after (or `''`).
3. `decodePart(text)`: `text.replace(/\+/g, ' ')`, then `decodeURIComponent` inside `try`, falling back to the spaced text.
4. Skip empty keys. First occurrence: define an own property. Later occurrences: upgrade a string to `[old, new]` or append to the array.

## Pitfalls

- `piece.split('=')` drops everything after a second `=` (base64 tokens, nested URLs).
- Decoding first and then replacing `+` turns an encoded `%2B` into a space.
- One malformed `%` crashing the whole page because `decodeURIComponent` throws a `URIError`.
- `result[key] = value` with `key === '__proto__'` silently does nothing for strings and **replaces the prototype** for arrays: a classic prototype-pollution entry point. `Object.defineProperty` or `Object.create(null)` avoid it.

## Follow-ups interviewers add

- **Bracket syntax:** `filter[size]=m&ids[]=1&ids[]=2` into nested objects and arrays, as `qs` does.
- **Type coercion:** an opt-in schema that turns `'2'` into `2` and `'true'` into `true`.
- **Compare with `URLSearchParams`:** what it does differently (it keeps every pair, `getAll`, no nesting).
- **The reverse:** see Stringify a query string.
