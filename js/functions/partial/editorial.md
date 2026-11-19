**Key insight:** partial application is "compute the final argument list, then `apply`". Doing that computation fresh on every call, from the untouched presets, is what keeps the function reusable.

## Approach

1. Close over `fn` and `presets`.
2. On each call, map over `presets`: a placeholder takes `args[next++]`, anything else stays.
3. Append `args.slice(next)` (the call arguments no placeholder consumed).
4. Return `fn.apply(this, finalArgs)`.

## Walkthrough

``const greet = (greeting, name, punct) => `${greeting}, ${name}${punct}` `` and `_ = partial.placeholder`:

| Call | Presets | Call arguments | Final arguments |
| --- | --- | --- | --- |
| `partial(greet, 'Hi')('Ana', '!')` | `['Hi']` | `['Ana', '!']` | `['Hi', 'Ana', '!']` |
| `partial(greet, _, 'Ana')('Hi', '?')` | `[_, 'Ana']` | `['Hi', '?']` | `['Hi', 'Ana', '?']` |
| same function again: `('Hey', '.')` | `[_, 'Ana']` (unchanged) | `['Hey', '.']` | `['Hey', 'Ana', '.']` |

Placeholders are filled from the call arguments in order; unused call arguments are appended. Because `presets` is never modified, the partially applied function can be called any number of times.

## Complexity

`O(p + a)` per call for `p` presets and `a` call arguments.

## Edge cases to test

- Presets only, call arguments only, and both.
- Placeholders at the start, middle and end.
- More placeholders than call arguments (the rest stay as placeholders and are passed through).
- Calling the same partial twice.
- `this` forwarding.

## Pitfalls

- Replacing placeholders inside `presets` itself: the first call fills them forever.
- Pushing call arguments onto `presets`: arguments pile up across calls.
- Arrow function for the returned wrapper loses `this`.
- Waiting for `fn.length` arguments: that's `curry`, not `partial`.

## Follow-ups interviewers add

- **`partialRight`:** presets go at the end.
- **`Function.prototype.bind`:** `fn.bind(null, ...presets)` is partial application without placeholders; what does `bind` do that this doesn't (`new`, `name`, `length`)?
- **`new` support:** make `new (partial(Point, 1))(2)` construct a `Point`.
- **Typing:** type `partial` for presets without placeholders using variadic tuple types.

## In the interview

Contrast `partial` (fixes some arguments, then runs on the next call) with `curry` (keeps collecting until the arity is reached). Note that `bind` is partial application without placeholders that also fixes `this`.
