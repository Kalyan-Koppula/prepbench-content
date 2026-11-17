**Key insight:** carry the path prefix down the recursion. Every leaf you reach already knows its full key; no post-processing needed.

## Approach

1. Write `isContainer(value)`: arrays, and objects whose prototype is `Object.prototype` or `null`.
2. `walk(value, prefix)` loops over `Object.keys(value)` (which gives indices for arrays) and builds `path = prefix ? prefix + '.' + key : key`.
3. Non-empty containers recurse; everything else, including empty containers, is written to `out[path]`.

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
