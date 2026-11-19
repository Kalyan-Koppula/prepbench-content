**Key insight:** treat the collected arguments as slots. Every call does one merge (fill holes left to right, append the rest) and one readiness check (first `fn.length` slots all real). Everything else is plain currying.

## Approach

1. Define `curry.placeholder` as a `Symbol`, so it can never collide with a real argument.
2. `step(have)` returns a function that merges `have` with the new arguments:
   - copy `have`;
   - walk it, replacing each placeholder with the next incoming argument while any remain;
   - append the incoming arguments that weren't used.
3. If the merged array has at least `fn.length` items and none of the first `fn.length` is a placeholder, call `fn(...merged)`. Otherwise return `step(merged)`.

## Walkthrough

`const f = curry((a, b, c) => [a, b, c])` with `_ = curry.placeholder`:

| Call | Merge | Collected | Ready? |
| --- | --- | --- | --- |
| `f(_, 2)` | nothing to fill | `[_, 2]` | no |
| `(_, 3)` | the incoming `_` fills the hole at index 0 (so it stays a hole); `3` is appended | `[_, 2, 3]` | no (`_` in the first 3) |
| `(1)` | `1` fills the hole at index 0 | `[1, 2, 3]` | yes → `[1, 2, 3]` |

The merge step walks the collected list and fills each placeholder, left to right, with the next incoming argument; leftovers are appended. The function runs only when the first `fn.length` arguments are all real values.

## Complexity

Merging is `O(k)` for `k` collected arguments per call; each call creates a new array, so intermediate functions remain reusable.

## Edge cases to test

- Placeholders in every position, including the last.
- Filling several holes in one call.
- Passing a placeholder into an existing hole (it stays a hole).
- Extra arguments beyond the arity.
- Reusing a partially applied function with different fills.

## Pitfalls

- Readiness by `args.length >= fn.length` alone: `c(_, 2, 3)` would call `fn` with the placeholder symbol.
- Appending first and filling holes second, which puts arguments in the wrong positions.
- Mutating `have` in place: `mid('a')` would permanently fill the hole for every later use of `mid`.
- Using `undefined` or `null` as the placeholder makes it impossible to pass those values on purpose.

## Follow-ups interviewers add

- **lodash parity:** `_.curry.placeholder` is shared with `_` itself; support placeholders passed after `fn.length`.
- **`curryRight`:** fill and append from the right.
- **`this` support:** call `fn` with the `this` of the completing call.
- **Types:** how would you even type placeholders in TypeScript? (Overloads, or give up and use tuples.)

## In the interview

Start from plain `curry`, then add the two pieces placeholders need: a merge that fills holes in order, and a readiness check that ignores placeholders. Walking through one three-call example on the whiteboard shows both.
