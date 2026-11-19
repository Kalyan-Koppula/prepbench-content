**Key insight:** recursion that returns "the new value at this position". A parent only makes a copy if some child returned something different, which gives you structural sharing and the "no change, same reference" rule in one place.

## Approach

1. If the spec has a `$` key, it must be its only key: apply the command to the current value and return the result.
2. Otherwise the current value must be an object or array. For each spec key, call `update(state[key], spec[key])`.
3. If the result is `Object.is` to the old child, skip it. On the first real change, make a shallow copy (`[...arr]` or `{ ...obj }`) and keep writing changed children into that copy.
4. Return the copy, or the original if nothing changed.

## Walkthrough

`update(state, { todos: { 1: { done: { $set: true } } } })` with `state = { todos: [t0, t1, t2], filter: 'all' }`:

| Level | Path | Action | New object? |
| --- | --- | --- | --- |
| 1 | root | copy root shallowly | yes |
| 2 | `todos` | copy the array | yes |
| 3 | `todos[1]` | copy the todo | yes |
| 4 | `done` | `$set` → `true` | – |

`filter`, `t0` and `t2` are **reused** by reference. Only the path to the change is copied, which is what makes React's `Object.is` comparisons and memoisation work: unchanged parts keep their identity.

## Complexity

`O(depth × width of copied nodes)`; untouched subtrees cost nothing.

## Edge cases to test

- Each command: `$set`, `$push`, `$merge`, `$apply`.
- The original state is unchanged.
- Untouched branches keep their references.
- A spec that changes nothing could return the same object (an optimisation worth mentioning).
- Invalid commands and targets throw.

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

## In the interview

Connect it to the real world: Redux reducers, React state updates and libraries like Immer (which lets you write mutations on a draft and produces the structurally shared result).
