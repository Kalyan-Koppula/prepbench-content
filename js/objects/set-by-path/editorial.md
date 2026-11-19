**Key insight:** decide each container's type by looking one key ahead: when you create `current[key]`, the key that will be written into it is `keys[i + 1]`.

## Approach

1. Parse the path into string keys (same regex as `get`), and return early for an empty path or any unsafe key.
2. Walk `keys[0..n-2]`. If `current[key]` is not an object, create `[]` when `keys[i + 1]` is all digits, otherwise `{}`. Step into it.
3. Assign `value` to the last key and return `obj`.

## Walkthrough

`set({}, 'a.b[0].c', 1)`:

| Step | Key | Exists? | Next key | Created |
| --- | --- | --- | --- | --- |
| 1 | `a` | no | `b` (not numeric) | `{}` |
| 2 | `b` | no | `0` (numeric) | `[]` |
| 3 | `0` | no | `c` | `{}` |
| final | `c` | – | – | assigned `1` |

Result: `{ a: { b: [{ c: 1 }] } }`. The type of each created container is decided by the **next** key: numeric keys get arrays.

## Complexity

`O(k)` for `k` segments.

## Edge cases to test

- Creating missing objects and arrays along the path.
- Overwriting primitives in the way with containers.
- Existing structures are preserved.
- `__proto__`, `constructor` and `prototype` segments are rejected (prototype pollution).
- The original object is mutated and returned (document this).

## Pitfalls

- Choosing the container from the **current** key instead of the next one: `'users[0]'` would make `users` an object.
- Always overwriting with a new container wipes out sibling data.
- `!current[key]` as the "missing" test also replaces `0` and `''`, which is fine here, but it would *not* replace `true` or `'text'`: you'd then try to set a property on a primitive, which silently does nothing in sloppy mode and throws in strict mode.
- **Prototype pollution:** `set({}, '__proto__.isAdmin', true)` walks into `Object.prototype` and makes every object in the app an admin. Libraries such as lodash shipped CVEs for exactly this. Rejecting `__proto__` alone is not enough: `constructor.prototype` reaches the same object.

## Follow-ups interviewers add

- **Immutable version:** return a new object, copying only the containers along the path (see "Immutable Update").
- **`unset(obj, path)`** and **`has(obj, path)`**.
- **Negative or huge indices:** `'list[1000000]'` creates a very sparse array; would you cap it?
- **Where this shows up:** form libraries map field names like `addresses[2].zip` onto state with exactly this helper.

## In the interview

Point out the mutation versus immutability decision and prototype pollution. For immutable state, contrast with [immutable-update](/frontend/js/immutable-update).
