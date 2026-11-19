**Key insight:** cloning is a recursive walk with exactly three cases: array, object, everything else. Each case either returns the value or builds a fresh container and recurses into it.

## Approach

1. If the value is an array, `map` each item through `deepClone`.
2. If it is a non-null object, create `{}` and copy every key from `Object.keys(value)` through `deepClone`.
3. Otherwise it is a primitive or a function: return it as is.

The order of the checks matters: arrays are objects too, so test `Array.isArray` first.

## Walkthrough

`deepClone({ user: { name: 'Ana', tags: ['a'] }, n: 1 })`:

| Value | Kind | Action |
| --- | --- | --- |
| the outer object | plain object | new `{}`, clone each key |
| `user` | plain object | new `{}` |
| `name` | string | returned as is (primitives are immutable) |
| `tags` | array | `map` to a new array, cloning each item |
| `n` | number | returned as is |

Every object and array in the result is new, so changing `copy.user.tags.push('b')` leaves the original untouched.

## Complexity

`O(n)` for `n` values in the structure; recursion depth equals the nesting depth.

## Edge cases to test

- Nested objects and arrays are new references at every level.
- Primitives, `null` and `undefined` pass through.
- Mutating the copy doesn't affect the original.
- Note what this simple version doesn't handle: cycles, dates, maps, sets, class instances.

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

## In the interview

Write the simple version, then list what it misses (cycles, built-ins, prototypes, symbol keys) and how [deep-clone-structured](/frontend/js/deep-clone-structured) handles each. In production, `structuredClone` covers most needs.
