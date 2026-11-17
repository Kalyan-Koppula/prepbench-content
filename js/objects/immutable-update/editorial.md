**Key insight:** recursion that returns "the new value at this position". A parent only makes a copy if some child returned something different, which gives you structural sharing and the "no change, same reference" rule in one place.

## Approach

1. If the spec has a `$` key, it must be its only key: apply the command to the current value and return the result.
2. Otherwise the current value must be an object or array. For each spec key, call `update(state[key], spec[key])`.
3. If the result is `Object.is` to the old child, skip it. On the first real change, make a shallow copy (`[...arr]` or `{ ...obj }`) and keep writing changed children into that copy.
4. Return the copy, or the original if nothing changed.

## Pitfalls

- Copying every level unconditionally: the result is correct, but every `React.memo` and selector downstream sees new references and re-renders anyway.
- `{ ...array }` turns an array into an object with numeric keys.
- `state.tags.push(...)` or `Object.assign(state.settings, ...)` inside a command mutates the original, which is the bug this whole pattern exists to prevent.
- Treating `$set: undefined` as "no command" because the value is falsy.

## Follow-ups interviewers add

- **More commands:** `$unshift`, `$splice: [[start, deleteCount, ...items]]`, `$unset: ['key']`, `$toggle`.
- **Compare with Immer:** `produce(state, draft => { draft.user.name = 'Grace' })` records mutations on a Proxy and replays them as copies like these. How would you build that?
- **Path-based API:** `setIn(state, ['user', 'address', 'city'], 'Paris')`.
- **Why does React need this?** `useState` and `memo` bail out with `Object.is`, so mutating in place means no re-render.
