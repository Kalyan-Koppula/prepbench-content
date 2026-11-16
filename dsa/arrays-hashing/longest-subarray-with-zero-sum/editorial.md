**Key insight:** `sum(nums[i..j]) = 0` iff `prefix[j + 1] === prefix[i]`. To maximise length, pair each prefix sum with the **earliest** index where that same sum appeared.

## Approach

1. `first = { 0: -1 }` — the empty prefix "ends" before index 0.
2. Walk the array with running `sum`.
3. If `sum` was seen before at index `first[sum]`, the subarray `first[sum] + 1 .. i` sums to zero — update the best length with `i - first[sum]`.
4. Otherwise record `first[sum] = i`. Never overwrite an existing entry: later indices only produce shorter subarrays.

## Complexity

- Time `O(n)` — one pass.
- Space `O(n)` — the map of first occurrences.

## Alternatives to mention

- Every start/end pair with a running sum: `O(n²)`.
- The same trick generalises to "longest subarray with sum `k`" (look up `sum - k`), and to "equal number of 0s and 1s" (map 0 to -1 first).
- With only non-negative numbers, a sliding window would also work for sum `k` — not here, because negatives break monotonicity.

## Pitfalls

- Forgetting the `{0: -1}` seed misses subarrays that start at index 0.
- Updating the stored index on every sighting gives the *shortest* match, not the longest.
