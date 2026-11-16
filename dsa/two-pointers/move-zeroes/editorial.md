**Key insight:** this is stable compaction. A write pointer marks the next slot for a non-zero; swapping each non-zero into it shifts the zeros toward the back automatically.

## Approach

1. `write = 0`.
2. For each `read`: if `nums[read] !== 0`, swap `nums[read]` with `nums[write]` and increment `write`.
3. Everything from `write` onward is now zero.

Invariant: `nums[0..write)` holds the non-zeros seen so far in order, and `nums[write..read)` is all zeros.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Two passes: copy non-zeros forward, then fill the tail with zeros. Same complexity; writes every slot even when there are few zeros.
- On the follow-up: the swap version only writes when a zero sits before a non-zero; skip the swap when `read === write`.

## Pitfalls

- Using a non-stable partition (swap with the end) breaks the relative order of non-zeros.
- Creating a new array and copying it back violates the in-place requirement.
