**Key insight:** currying is recursion on the argument count. A curried function either has enough arguments (call `fn`) or returns a new function that closes over the arguments collected *so far*.

## Approach

1. Return `curried(...args)`.
2. If `args.length >= fn.length`, return `fn(...args)`.
3. Otherwise return `(...more) => curried(...args, ...more)`. Spreading creates a new array each step, so every partial application owns its own arguments.

## Walkthrough

`const add3 = curry((a, b, c) => a + b + c)`; `fn.length` is 3.

| Call | Collected arguments | Enough? | Returns |
| --- | --- | --- | --- |
| `add3(1)` | `[1]` | no | a function waiting for more |
| `(2)` | `[1, 2]` | no | another function |
| `(3)` | `[1, 2, 3]` | yes | `6` |
| `add3(1, 2)(3)` | `[1, 2]` then `[1, 2, 3]` | yes | `6` |
| `add3(1, 2, 3, 4)` | `[1, 2, 3, 4]` | yes (≥ 3) | `6`; extras are passed through and ignored |

Each partial call returns a **new** function closing over its own argument list, so `const add1 = add3(1)` can be reused: `add1(2)(3)` and `add1(10)(20)` don't interfere.

## Complexity

Each call copies the collected arguments: `O(k)` per call for `k` arguments so far, `O(n²)` worst case to reach arity `n` one argument at a time (tiny in practice).

## Edge cases to test

- All arguments at once, one at a time, and mixed groupings.
- Reusing an intermediate function twice (no shared state between branches).
- A function with zero declared parameters (called immediately).
- Default or rest parameters, which `fn.length` doesn't count.

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

## In the interview

Explain that `fn.length` defines "enough", show the reuse case to prove there's no shared mutable state, and mention that default and rest parameters break `fn.length`, so real libraries accept an explicit arity.
