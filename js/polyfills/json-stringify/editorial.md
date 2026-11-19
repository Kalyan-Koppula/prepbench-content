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

## Walkthrough

`jsonStringify({ a: [1, undefined, () => 1], b: undefined, c: new Date(0), d: 'x"y' })`:

| Key | Value | Serialised |
| --- | --- | --- |
| `a[0]` | `1` | `1` |
| `a[1]` | `undefined` in an array | `null` |
| `a[2]` | function in an array | `null` |
| `b` | `undefined` in an object | **omitted** |
| `c` | `Date` → `toJSON()` | `"1970-01-01T00:00:00.000Z"` |
| `d` | string with a quote | `"x\"y"` |

Result: `{"a":[1,null,null],"c":"1970-01-01T00:00:00.000Z","d":"x\"y"}`. Cycles throw a `TypeError`, tracked with a stack of objects currently being serialised.

## Complexity

`O(n)` for `n` values plus the output length.

## Edge cases to test

- Primitives, `null`, nested objects and arrays.
- `undefined`, functions and symbols: omitted in objects, `null` in arrays, `undefined` at the top level.
- `NaN` and `Infinity` become `null`.
- `toJSON` is called (dates).
- Escaping of quotes, backslashes and control characters.
- Cycles throw; BigInt throws.

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

## In the interview

Interviewers mostly probe the `undefined`/function rules and cycles. Mention `replacer` and `space` arguments as extensions.
