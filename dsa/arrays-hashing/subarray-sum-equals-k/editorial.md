**Key insight:** a subarray ending at `j` sums to `k` exactly when some earlier prefix sum equals `prefix_j - k`. Keep a map of how many times each prefix sum has occurred and add that count at every step.

## Approach

1. `counts = { 0: 1 }` — the empty prefix, so subarrays starting at index 0 are counted.
2. Walk the array keeping a running `sum`.
3. At each element, add `counts[sum - k]` (if any) to the answer, then increment `counts[sum]`.

Lookup happens *before* recording the current prefix, so a subarray can never be empty — this matters when `k = 0`.

## Complexity

- Time `O(n)` — one pass with O(1) map operations.
- Space `O(n)` — up to `n + 1` distinct prefix sums.

## Alternatives to mention

- All start/end pairs with a running sum: `O(n²)` time, `O(1)` space.
- Sliding window does **not** work here: with negative numbers, extending the window can decrease the sum, so you can't decide which end to move. Interviewers often probe this.

## Pitfalls

- Missing the `{0: 1}` seed loses every subarray that starts at index 0.
- The answer is a count, not a yes/no — several earlier prefixes can match at once (zeros in the input create repeated prefix sums).
