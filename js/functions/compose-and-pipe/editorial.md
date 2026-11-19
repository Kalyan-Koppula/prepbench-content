**Key insight:** `pipe` is `reduce` over the function list with the running value as the accumulator; `compose` is the same thing read from the other end.

## Approach

1. `pipe(...fns)` returns a regular `function` (to receive `this`).
2. With no functions, return `args[0]`.
3. Run the first function with `apply(this, args)`, then `reduce` the rest: `(value, f) => f.call(this, value)`.
4. `compose(...fns)` = `pipe(...fns.slice().reverse())`, or `reduceRight` directly.

## Walkthrough

`pipe(trim, toLower, slugify)('  Hello World ')`:

| Step | Function | Value after |
| --- | --- | --- |
| 1 | `trim` (receives all original arguments) | `'Hello World'` |
| 2 | `toLower` | `'hello world'` |
| 3 | `slugify` | `'hello-world'` |

`compose(slugify, toLower, trim)` is the same pipeline written right to left: it reverses a copy of the list and delegates to `pipe`. Only the first function receives every argument; each later one receives the previous result.

## Complexity

Building the pipeline is `O(n)` for `n` functions (the reverse copy for `compose`); each call runs every function once, so `O(n)` plus their own costs.

## Edge cases to test

- No functions: returns the first argument unchanged.
- One function: behaves exactly like that function, including multiple arguments.
- The first function takes several arguments: `pipe(Math.max, double)(1, 5, 3)` is 10.
- `this` is forwarded when the composed function is used as a method.
- The original array of functions isn't mutated by `compose` (it reverses a copy).

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

## In the interview

State the direction first ("pipe runs left to right, compose right to left, like f(g(x))"), write `pipe` with `reduce`, then define `compose` in terms of it. Mention the async variant (`await` each step) as the natural follow-up.
