**Key insight:** most of the work is in the small rules: split on the *first* `=`, replace `+` *before* percent-decoding, and never let a decode error throw. The repeated-key logic is a three-state upgrade: absent, string, array.

## Approach

1. Strip one leading `?`, split on `&`, skip empty pieces.
2. `eq = piece.indexOf('=')`; key is everything before it (or the whole piece), value everything after (or `''`).
3. `decodePart(text)`: `text.replace(/\+/g, ' ')`, then `decodeURIComponent` inside `try`, falling back to the spaced text.
4. Skip empty keys. First occurrence: define an own property. Later occurrences: upgrade a string to `[old, new]` or append to the array.

## Walkthrough

`parseQuery('?tag=js&tag=css&q=hello+world&empty&x=%E2%9C%93')`:

| Piece | Key | Value | Result |
| --- | --- | --- | --- |
| `tag=js` | tag | js | `{ tag: 'js' }` |
| `tag=css` | tag | css | repeated key becomes an array: `['js', 'css']` |
| `q=hello+world` | q | `+` → space | `'hello world'` |
| `empty` | empty | no `=` | `''` |
| `x=%E2%9C%93` | x | percent-decoded | `'✓'` |

Malformed percent sequences (`%E2%9`) are kept as raw text instead of throwing.

## Complexity

`O(n)`.

## Edge cases to test

- Leading `?` optional.
- Repeated keys produce arrays.
- `+` as space and percent decoding.
- Keys without values; empty pieces (`a=1&&b=2`).
- Malformed encodings.
- Keys like `__proto__` don't affect prototypes.

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

## In the interview

Mention `URLSearchParams` (`new URLSearchParams(search).getAll('tag')`) as the built-in answer, and the questions custom parsers must answer: arrays, nesting (`a[b]=1`) and encoding rules.
