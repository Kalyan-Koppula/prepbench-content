**Key insight:** at each level, take the **union** of both key sets and put every key into exactly one bucket. You only recurse when both sides are the same kind of container; anything else is decided right there.

## Approach

1. `walk(a, b, prefix)` builds `keys = new Set([...Object.keys(a), ...Object.keys(b)])`.
2. For each key: not own in `a` means added, not own in `b` means removed.
3. Otherwise, if both values are plain objects or both are arrays, recurse with the extended prefix (`Object.keys` on an array gives the indices).
4. Otherwise compare with `Object.is` and record a change.

## Walkthrough

`diff({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 5 }, e: 0 })`:

| Path | Before | After | Classified |
| --- | --- | --- | --- |
| `a` | 1 | 1 | unchanged |
| `b` | object | object | recurse |
| `b.c` | 2 | 5 | changed |
| `b.d` | 3 | missing | removed |
| `e` | missing | 0 | added |

Result: `{ added: ['e'], removed: ['b.d'], changed: ['b.c'] }`. Containers of the same kind are compared recursively; anything else is compared with `Object.is`.

## Complexity

`O(n)` over the union of keys.

## Edge cases to test

- Added, removed and changed keys at several levels.
- An object replaced by an array (reported as changed).
- `NaN` to `NaN` isn't a change; `0` to `-0` is under `Object.is`.
- Keys whose value is `undefined` versus missing keys.

## Pitfalls

- Checking `a[key] === undefined` instead of `hasOwnProperty`: a key explicitly set to `undefined` looks missing.
- Recursing into anything with `typeof === 'object'`: a `Map` or `Date` has no own keys, so real changes vanish; and an object-to-array change gets reported as a pile of index adds and key removals.
- Recursing into a freshly added object reports every leaf as added, which is noisy and not what an audit log wants.
- `===` reports `NaN -> NaN` as a change.

## Follow-ups interviewers add

- **Return values too:** `changed: [{ path, from, to }]`, which is enough to build an undo step or a JSON Patch.
- **Arrays of records:** match items by `id` instead of by index, so inserting at the front isn't "everything changed".
- **Dates and other value types:** compare by value (`getTime`) instead of reference.
- **Apply a diff** to `before` to get `after`, and invert it.
- **Cycles:** track visited pairs, like in "Deep Equal".

## In the interview

Clarify the output format first (paths, or a patch like JSON Patch). Mention uses: audit logs, form "unsaved changes" detection, and sending minimal updates to a server.
