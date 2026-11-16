**Key insight:** the best subarray ending at `i` either extends the best one ending at `i - 1` or starts fresh at `i` — and you only extend when the running sum is positive (Kadane's algorithm).

## Approach

1. Keep `cur`, the best sum of a subarray that ends exactly at the current index, and `best`, the answer so far.
2. For each `nums[i]`: `cur = max(nums[i], cur + nums[i])`, then `best = max(best, cur)`.
3. Initialise both to `nums[0]` (not `0`) so an all-negative array returns its largest element.

Greedy view: a prefix with negative sum can never help any subarray that starts after it, so drop it the moment it goes negative. DP view: `cur` is `dp[i]` with the table collapsed to one variable.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Brute force over all `(i, j)` with a running sum: `O(n²)`.
- Prefix sums: answer is `max(prefix[j] - min(prefix[i]) for i < j)` — same `O(n)`, a useful reframing.
- Divide and conquer: best of left half, right half, and the best sum crossing the middle — `O(n log n)`. Interviewers sometimes ask for it as the follow-up.

## Pitfalls

- Starting `best` at `0` returns `0` for `[-3, -1, -2]`; the subarray must be non-empty.
- Follow-up "return the indices": record `start` when you restart and copy `(start, i)` whenever `best` improves.
