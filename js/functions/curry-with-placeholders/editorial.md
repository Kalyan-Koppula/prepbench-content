**Key insight:** treat the collected arguments as slots. Every call does one merge (fill holes left to right, append the rest) and one readiness check (first `fn.length` slots all real). Everything else is plain currying.

## Approach

1. Define `curry.placeholder` as a `Symbol`, so it can never collide with a real argument.
2. `step(have)` returns a function that merges `have` with the new arguments:
   - copy `have`;
   - walk it, replacing each placeholder with the next incoming argument while any remain;
   - append the incoming arguments that weren't used.
3. If the merged array has at least `fn.length` items and none of the first `fn.length` is a placeholder, call `fn(...merged)`. Otherwise return `step(merged)`.

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
