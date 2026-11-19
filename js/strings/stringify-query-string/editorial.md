**Key insight:** everything reduces to one recursive `add(key, value)` that knows how each type contributes pairs. Arrays reuse the key, objects extend it with `[child]`, and scalars finally emit `key=encoded`.

## Approach

1. `pairs = []`; for each top-level key, `add(encodeURIComponent(key), value)`; return `pairs.join('&')`.
2. `add(key, value)`, in this order:
   - `undefined`: return;
   - array: `add(key, item)` for each item (flattens nesting for free);
   - Date: push `key=encodeURIComponent(value.toISOString())`;
   - other non-null object: `add(key + '[' + encodeURIComponent(child) + ']', value[child])` for each own key;
   - scalar: push `key=` plus `''` for `null`, else `encodeURIComponent(String(value))`.

## Walkthrough

`stringifyQuery({ q: 'a b', tags: ['x', 'y'], filter: { min: 1 }, skip: undefined, empty: null })`:

| Key | Value | Output |
| --- | --- | --- |
| `q` | `'a b'` | `q=a%20b` |
| `tags` | array | `tags=x&tags=y` (repeated key) |
| `filter` | object | `filter[min]=1` (bracket nesting) |
| `skip` | `undefined` | omitted |
| `empty` | `null` | `empty=` |

Result: `q=a%20b&tags=x&tags=y&filter[min]=1&empty=`.

## Complexity

`O(n)` over all values.

## Edge cases to test

- Encoding of spaces and reserved characters.
- Arrays as repeated keys.
- Nested objects with bracket keys.
- `undefined` omitted, `null` as empty.
- Dates as ISO strings.
- Round trip with the parser for flat inputs.

## Pitfalls

- `encodeURI` instead of `encodeURIComponent`: it leaves `&`, `=`, `?`, `/` and `+` alone, which corrupts the query.
- Checking `typeof value === 'object'` before arrays, Dates and `null` (`typeof null === 'object'`).
- `instanceof Date` fails for dates from another realm (an iframe, a worker, a test sandbox); `Object.prototype.toString.call(v) === '[object Date]'` does not.
- Encoding the whole `a[b]` key, which turns the brackets into `%5B%5D`. That is valid, but not the format the statement asks for.

## Follow-ups interviewers add

- **Array formats:** `ids[]=1&ids[]=2`, `ids=1,2`, or `ids[0]=1` (each backend expects something different).
- **Sorted keys** for stable cache keys.
- **Use `URLSearchParams`:** when is it enough, and why does it encode spaces as `+`?
- **Round trip** with Parse a query string: which values cannot survive it (types, `null` vs `''`)?

## In the interview

Clarify the array and nesting conventions (repeated keys, `a[]=`, or comma-separated), since servers disagree. `URLSearchParams` handles flat cases with `toString()`.
