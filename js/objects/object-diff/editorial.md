**Key insight:** at each level, take the **union** of both key sets and put every key into exactly one bucket. You only recurse when both sides are the same kind of container; anything else is decided right there.

## Approach

1. `walk(a, b, prefix)` builds `keys = new Set([...Object.keys(a), ...Object.keys(b)])`.
2. For each key: not own in `a` means added, not own in `b` means removed.
3. Otherwise, if both values are plain objects or both are arrays, recurse with the extended prefix (`Object.keys` on an array gives the indices).
4. Otherwise compare with `Object.is` and record a change.

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
