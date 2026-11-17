**Key insight:** currying is recursion on the argument count. A curried function either has enough arguments (call `fn`) or returns a new function that closes over the arguments collected *so far*.

## Approach

1. Return `curried(...args)`.
2. If `args.length >= fn.length`, return `fn(...args)`.
3. Otherwise return `(...more) => curried(...args, ...more)`. Spreading creates a new array each step, so every partial application owns its own arguments.

## Pitfalls

- Collecting into one shared array (`args.push(...)`) in the outer closure: the second use of a partially applied function sees the first one's arguments.
- Counting calls instead of arguments: `c(1, 2)(3)` breaks.
- Checking `===` instead of `>=` loses calls that pass extra arguments in the last step.
- Treating a call with no arguments as "done": `c()` must not run `fn` when arity is above 0.

## Follow-ups interviewers add

- **Placeholders:** `curry.placeholder` to skip positions (*Curry with placeholders*).
- **`this`:** call `fn` with the `this` of the call that completes the arguments.
- **Explicit arity:** `curry(fn, n)` for variadic functions where `fn.length` is 0.
- **Infinite curry:** `sum(1)(2)(3)()` returns 6 when called with no arguments, or `sum(1)(2) + 3` via `valueOf`.
- **Types:** write a TypeScript type for `curry` that tracks the remaining parameters.
