**Key insight:** cloning is a recursive walk with exactly three cases: array, object, everything else. Each case either returns the value or builds a fresh container and recurses into it.

## Approach

1. If the value is an array, `map` each item through `deepClone`.
2. If it is a non-null object, create `{}` and copy every key from `Object.keys(value)` through `deepClone`.
3. Otherwise it is a primitive or a function: return it as is.

The order of the checks matters: arrays are objects too, so test `Array.isArray` first.

## Pitfalls

- `typeof null === 'object'`. Without a null check, `null` turns into `{}`.
- `for...in` walks inherited enumerable properties; use `Object.keys` (or `for...in` plus `hasOwnProperty`).
- `JSON.parse(JSON.stringify(x))` is the classic shortcut, but it drops `undefined` values and functions, turns `NaN` into `null` and throws on `bigint`. Say so if you mention it.
- `{ ...obj }` and `Object.assign` are shallow: nested objects are still shared.

## Follow-ups interviewers add

- **Cycles and shared references:** keep a `WeakMap` from original to clone (see "Deep Clone with Cycles and Built-ins").
- **Dates, Maps, Sets, RegExps:** each needs its own branch.
- **Very deep data:** recursion can overflow the stack; rewrite it with an explicit stack of `[source, target]` pairs.
- **`__proto__` as a data key** (from `JSON.parse`): `out['__proto__'] = x` changes the prototype instead of adding a key; use `Object.defineProperty` or a null-prototype object.
- **When would you use `structuredClone`?** Built into browsers; handles cycles and built-ins but throws on functions and drops prototypes.
