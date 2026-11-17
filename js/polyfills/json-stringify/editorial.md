**Key insight:** one recursive function that returns either a string or `undefined` ("nothing to write") covers almost every rule: objects skip `undefined` results, arrays write `null` instead, and the top level returns it as is.

## Approach

1. `serialize(key, value)`:
   - If `value` is an object with a `toJSON` method, replace it with `value.toJSON(key)`.
   - `null` → `'null'`. Then switch on `typeof`: strings are quoted, numbers are `String(n)` if finite else `'null'`, booleans `String(b)`, BigInt throws, `undefined`/function/symbol return `undefined`.
   - Objects: if the value is already on the stack, throw a `TypeError` (cycle). Push it.
     - Arrays: loop `0 … length - 1`, `serialize(String(i), v[i]) ?? 'null'`, join with commas.
     - Plain objects: for each key of `Object.keys(v)`, serialize; skip `undefined`; emit `quote(key) + ':' + result`.
   - Pop and return.
2. `quote(s)`: walk the string by code unit, using short escapes for `" \ \b \f \n \r \t`, `\u00xx` for other control characters, everything else unchanged.
3. Return `serialize('', value)`.

## Pitfalls

- A global `seen` set instead of a stack: the same object referenced twice (not a cycle) is wrongly rejected.
- `typeof v === 'object'` before checking `null`.
- `Number.isNaN` only: `Infinity` must become `null` too.
- `for…in` for keys: includes inherited enumerable properties.
- Using `'"' + s + '"'` with no escaping, or escaping with a regex that misses `\b`/`\f` or uses uppercase hex.
- Calling `toJSON` without the key argument, or only at the top level.

## Follow-ups interviewers add

- **`replacer`:** a function `(key, value)` called with the holder as `this`, or an array whitelist of keys.
- **`space`:** pretty-printing with indentation and newlines (the output format gets fiddly: empty arrays stay `[]`).
- **Boxed primitives:** `new String('x')` serializes as `"x"`.
- **Lone surrogates:** modern engines escape them as `\udXXX` ("well-formed JSON.stringify").
- **`JSON.parse`:** write a recursive-descent parser for the same subset.
