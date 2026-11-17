**Key insight:** each flat key is a `set(root, path, value)` call. The only extra work is knowing which containers you built yourself, so you can tell "walk into it" apart from "that's someone's value".

## Approach

1. For each key, split on `.` and skip it if any segment is unsafe.
2. Walk all segments but the last. If the segment is missing, create `[]` when the **next** segment is all digits, else `{}`, and remember the new container in a `WeakSet`.
3. If the segment exists but isn't one of your containers, it is a leaf: throw.
4. At the last segment, if it already holds one of your containers, assigning would wipe nested keys: throw. Otherwise assign.

## Pitfalls

- Checking `typeof node[part] === 'object'` instead of "did I build it": a value like `{ settings: { a: 1 } }` gets mutated by `'settings.b'`, so the input leaks into and is changed by the output.
- Choosing array vs object from the current segment instead of the next.
- Silently letting the later key win hides bad input and makes the result depend on key order.
- `'__proto__.x'` walks into `Object.prototype` when containers are found with plain property access.

## Follow-ups interviewers add

- **Bracket syntax:** accept `users[0].name` too (parse with the same regex as `get`).
- **Escaped dots:** let `'a\\.b'` mean a single key `a.b`.
- **Sparse indices:** `{ 'list.5': 'x' }` creates a 6-slot array with holes. Would you compact it, or reject it?
- **Query strings:** turn `URLSearchParams` like `filter.status=open&filter.tags.0=bug` into nested state.
