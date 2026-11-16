**Key insight:** count contributions instead of subarrays. `arr[i]` is the minimum of exactly `left[i] × right[i]` subarrays, where `left[i]` and `right[i]` are how far you can extend before hitting a smaller element. The answer is `Σ arr[i] · left[i] · right[i]`.

## Approach

1. `left[i]` = `i - (index of previous element < arr[i])`, or `i + 1` if none. Found with an increasing monotonic stack, scanning left to right.
2. `right[i]` = `(index of next element <= arr[i]) - i`, or `n - i` if none. Same idea, scanning right to left.
3. Sum `arr[i] * left[i] * right[i]` modulo `10^9 + 7`.

**Tie-breaking:** in `[3, 3]`, the subarray `[3, 3]` must be credited to one of the two 3s, not both. Strict `<` on one side and `<=` on the other guarantees each subarray's minimum is attributed to its leftmost (or rightmost) occurrence only.

## Complexity

- Time `O(n)` — two monotonic-stack passes and one sum.
- Space `O(n)`.

## Alternatives to mention

- Brute force with a running minimum: `O(n²)` — fine for small `n`, too slow at `3 · 10^4` in many languages.
- One-pass DP: `dp[i] = dp[prevSmaller(i)] + arr[i] · (i - prevSmaller(i))` is the sum of minimums of subarrays ending at `i`; the answer is `Σ dp[i]`.

## Pitfalls

- Using `<` (or `<=`) on both sides — duplicates get double-counted (or missed).
- Overflow in fixed-width languages: `arr[i] · left · right` can reach about `2.7 · 10^13`. In JS that's still an exact integer (< `2^53`), but take the modulo each step.
