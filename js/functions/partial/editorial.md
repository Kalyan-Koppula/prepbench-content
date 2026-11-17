**Key insight:** partial application is "compute the final argument list, then `apply`". Doing that computation fresh on every call, from the untouched presets, is what keeps the function reusable.

## Approach

1. Close over `fn` and `presets`.
2. On each call, map over `presets`: a placeholder takes `args[next++]`, anything else stays.
3. Append `args.slice(next)` (the call arguments no placeholder consumed).
4. Return `fn.apply(this, finalArgs)`.

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
