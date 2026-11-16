**Key insight (Boyer–Moore voting):** cancel each occurrence of one value against an occurrence of a different value. The majority has more copies than everything else combined, so it is the only value that can survive.

## Approach

1. Keep `candidate` and `count = 0`.
2. For each `x`: if `count === 0`, set `candidate = x`. Then `count += x === candidate ? 1 : -1`.
3. Return `candidate`.

Because a majority is guaranteed, no verification pass is needed. Without that guarantee, do a second pass to count `candidate` and confirm it exceeds `n / 2`.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Hash map of counts: `O(n)` time and space — the natural first answer.
- Sort and return `nums[floor(n / 2)]`: `O(n log n)`; the majority must cover the middle index.
- Bit counting: for each of 32 bits, the majority's bit wins the vote — `O(32n)`. Watch sign handling in JS.

## Pitfalls

- Explain *why* voting works when asked: each decrement pairs one majority copy with at most one non-majority copy.
