**Key insight:** `pipe` is `reduce` over the function list with the running value as the accumulator; `compose` is the same thing read from the other end.

## Approach

1. `pipe(...fns)` returns a regular `function` (to receive `this`).
2. With no functions, return `args[0]`.
3. Run the first function with `apply(this, args)`, then `reduce` the rest: `(value, f) => f.call(this, value)`.
4. `compose(...fns)` = `pipe(...fns.slice().reverse())`, or `reduceRight` directly.

## Pitfalls

- `fns.reverse()` reverses the caller's array in place; with rest parameters it's a fresh array, but the habit bites when the list is passed in.
- Starting `reduce` with `args` as the accumulator: the first function then receives an array instead of spread arguments.
- `reduce` with no initial value on an empty list throws a `TypeError`; handle the empty case.
- Arrow functions as the returned wrapper lose `this`.

## Follow-ups interviewers add

- **Async pipe:** functions may return promises; await each step (`reduce` over a promise chain).
- **Short-circuit:** stop the pipeline when a step returns `null` (a "maybe" pipe).
- **Middleware:** build Redux-style `compose` for `(next) => (action) => …` middleware.
- **Types:** overloads or recursive types so `pipe` infers the final return type.
