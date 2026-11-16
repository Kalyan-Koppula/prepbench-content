**Key insight:** the minimum of a stack only depends on what's below the top, so store the "minimum so far" alongside every element. Popping then restores the previous minimum for free.

## Approach

Keep two parallel stacks:

- `values` — the actual elements.
- `mins` — `mins[i]` is the minimum of `values[0..i]`. On push, append `min(val, previous min)`; on pop, pop both.

`getMin()` reads the top of `mins`.

## Complexity

- `O(1)` per operation, `O(n)` extra space.

## Alternatives to mention

- Space-saving variant: push to `mins` only when `val <= current min`, and pop from it only when the popped value equals the current min. The `<=` matters with duplicate minimums.
- Single stack storing `[value, minSoFar]` pairs — same idea, one array.
- `O(1)` extra space trick: store encoded differences (`val - min`) and recover the previous min on pop. Clever, but overflow-prone in fixed-width languages; mention only if asked.

## Pitfalls

- Tracking a single `min` variable: after popping the minimum you can't recover the previous one.
- In the space-saving variant, using `<` instead of `<=` loses duplicates of the minimum.
