**Key insight:** everything reduces to one recursive `add(key, value)` that knows how each type contributes pairs. Arrays reuse the key, objects extend it with `[child]`, and scalars finally emit `key=encoded`.

## Approach

1. `pairs = []`; for each top-level key, `add(encodeURIComponent(key), value)`; return `pairs.join('&')`.
2. `add(key, value)`, in this order:
   - `undefined`: return;
   - array: `add(key, item)` for each item (flattens nesting for free);
   - Date: push `key=encodeURIComponent(value.toISOString())`;
   - other non-null object: `add(key + '[' + encodeURIComponent(child) + ']', value[child])` for each own key;
   - scalar: push `key=` plus `''` for `null`, else `encodeURIComponent(String(value))`.

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
