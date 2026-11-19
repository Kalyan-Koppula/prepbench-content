**Key insight:** carry the path prefix down the recursion. Every leaf you reach already knows its full key; no post-processing needed.

## Approach

1. Write `isContainer(value)`: arrays, and objects whose prototype is `Object.prototype` or `null`.
2. `walk(value, prefix)` loops over `Object.keys(value)` (which gives indices for arrays) and builds `path = prefix ? prefix + '.' + key : key`.
3. Non-empty containers recurse; everything else, including empty containers, is written to `out[path]`.

## Walkthrough

`flattenObject({ a: { b: 1, c: [10, 20] }, d: {}, e: null })`:

| Path | Value | Container with keys? | Output entry |
| --- | --- | --- | --- |
| `a` | object | yes | recurse |
| `a.b` | 1 | no | `'a.b': 1` |
| `a.c` | array | yes | recurse |
| `a.c.0`, `a.c.1` | 10, 20 | no | `'a.c.0': 10`, `'a.c.1': 20` |
| `d` | `{}` | empty | `'d': {}` (kept so it isn't lost) |
| `e` | `null` | no | `'e': null` |

## Complexity

`O(n)` for `n` leaves, plus string building for the paths.

## Edge cases to test

- Nested objects and arrays.
- Empty objects and arrays are preserved as values.
- `null`, dates and class instances are leaves, not recursed into.
- Round-trip with `unflattenObject` gives back the original.

## Pitfalls

- `typeof x === 'object'` as the container test recurses into `Date` (no own keys, so it disappears) and into class instances.
- Forgetting empty containers: `{ filters: {} }` flattens to `{}` and the key is lost.
- Building the key as `prefix + '.' + key` at the top level gives `'.a'`.
- `if (value)` style checks drop `0`, `false` and `null` leaves.

## Follow-ups interviewers add

- **Bracket notation for arrays:** produce `users[0].name` instead of `users.0.name`.
- **Custom separator** or a max depth.
- **Keys that contain dots** make the output ambiguous. How would you escape them?
- **Iterative version** with a stack of `[value, prefix]`.
- **The reverse:** see "Unflatten Object".

## In the interview

State the rules for empty containers and non-plain objects; they're where implementations differ. Mention the use case (form state, translations files, query strings) and the inverse operation.
