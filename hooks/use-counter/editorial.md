**Key insight:** one `clamp` function and functional updates handle every requirement: bounds are enforced in one place and batched calls build on each other.

## Approach

Default the bounds to `-Infinity` / `Infinity` so `clamp = n => Math.min(max, Math.max(min, n))` works when either is omitted. Initialise state lazily with `clamp(initial)`. `increment` is `setCount(c => clamp(c + step))`; `decrement` mirrors it; `set` and `reset` clamp their target. Each helper is a `useCallback` keyed on the bounds and step it reads, so a changed `max` produces a new helper that sees it.

## Pitfalls

- `setCount(count + step)` uses the `count` from the render that created the handler; three calls in one click add `step` once.
- Clamping only in `increment`/`decrement` lets `initial` or `set(999)` escape the range.
- `useCallback(..., [])` around the helpers freezes the first `min`/`max`/`step` forever (a stale closure). Either list them as dependencies or read them from a ref.
- `if (!max)` style checks treat `max: 0` as "no max".

## Follow-ups

- Should lowering `max` below the current count clamp it immediately? (Add an effect, or derive `Math.min(count, max)` when rendering.)
- Add `canIncrement` / `canDecrement` booleans to disable buttons.
- Make `set` accept an updater function like `setState`.
