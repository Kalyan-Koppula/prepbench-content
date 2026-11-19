**Key insight:** each flat key is a `set(root, path, value)` call. The only extra work is knowing which containers you built yourself, so you can tell "walk into it" apart from "that's someone's value".

## Approach

1. For each key, split on `.` and skip it if any segment is unsafe.
2. Walk all segments but the last. If the segment is missing, create `[]` when the **next** segment is all digits, else `{}`, and remember the new container in a `WeakSet`.
3. If the segment exists but isn't one of your containers, it is a leaf: throw.
4. At the last segment, if it already holds one of your containers, assigning would wipe nested keys: throw. Otherwise assign.

## Walkthrough

`unflattenObject({ 'a.b': 1, 'a.c.0': 'x', 'a.c.1': 'y', d: true })`:

| Flat key | Parts | Containers created | Assigned |
| --- | --- | --- | --- |
| `a.b` | `a`, `b` | `a` → `{}` (next part isn't numeric) | `a.b = 1` |
| `a.c.0` | `a`, `c`, `0` | `c` → `[]` (next part is numeric) | `a.c[0] = 'x'` |
| `a.c.1` | – | reuses `a.c` | `a.c[1] = 'y'` |
| `d` | `d` | – | `d = true` |

Result: `{ a: { b: 1, c: ['x', 'y'] }, d: true }`. Conflicts such as `{ a: 1, 'a.b': 2 }` throw instead of silently losing data, and dangerous segments like `__proto__` are skipped.

## Complexity

`O(total characters in the keys)`.

## Edge cases to test

- Objects and arrays created from numeric segments.
- Round-trip with `flattenObject`.
- Conflicting keys throw.
- Prototype-polluting segments are ignored.

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

## In the interview

Discuss the ambiguity choices (numeric segments mean arrays; conflicts throw) and the security angle. Typical uses: parsing form field names like `address.city`, or translation files.
