**Key idea:** the sum of `nums[j+1..i]` equals `prefix[i] - prefix[j]`. So a subarray ending at `i` sums to `k` exactly when some earlier prefix sum equals `prefix[i] - k`. Scan once, keep a map from prefix sum to how many times it has occurred, and add up the matches.

## Recognising the pattern

Contiguous subarrays and a target sum suggest a sliding window, but the values **can be negative**, so shrinking a window doesn't reliably lower the sum, and the window approach breaks. Whenever you need "range sum equals something" with negative numbers, reach for **prefix sums plus a hash map**, one of the key tools in the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. It turns a range question into a lookup.

## Brute force

For each start index, extend the end one step at a time, keeping a running sum, and count every time the sum equals `k`. That is the reference brute force below.

Correct because it visits every non-empty subarray exactly once. Time `O(n²)`, space `O(1)`. With `n = 2 · 10^4` that is 200 million additions: borderline, and the interviewer will want better.

## Optimal: prefix sums with a count map

Define `prefix[i]` as the sum of `nums[0..i]`, and `prefix[-1] = 0` for the empty prefix. Then the subarray from `j + 1` to `i` sums to `prefix[i] - prefix[j]`. Setting that equal to `k` gives `prefix[j] = prefix[i] - k`. For a fixed end `i`, the number of good subarrays is the number of earlier prefixes with that value.

1. Create a map `prefixCount` with `0 → 1` (the empty prefix, so subarrays starting at index 0 are counted).
2. Set `sum = 0`, `total = 0`.
3. For each `i`:
   1. `sum += nums[i]`.
   2. Add `prefixCount[sum - k]` (or 0) to `total`.
   3. Increment `prefixCount[sum]`.
4. Return `total`.

**Order matters.** Look up before you record the current prefix. If you recorded first and `k` were 0, the current prefix would match itself, counting an empty subarray.

Counts, not indices, are stored, because several earlier prefixes can share a value and each one starts a different valid subarray.

## Walkthrough

`nums = [1, 2, -1, 2]`, `k = 3`

| i | value | sum | look up `sum − k` | matches | total | map after |
| --- | --- | --- | --- | --- | --- | --- |
| – | – | 0 | – | – | 0 | {0:1} |
| 0 | 1 | 1 | −2 | 0 | 0 | {0:1, 1:1} |
| 1 | 2 | 3 | 0 | 1 | 1 | {0:1, 1:1, 3:1} |
| 2 | −1 | 2 | −1 | 0 | 1 | + {2:1} |
| 3 | 2 | 4 | 1 | 1 | 2 | + {4:1} |

Answer `2`: the subarrays `[1, 2]` and `[2, -1, 2]`.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Prefix map: time `O(n)` on average, one map lookup and one update per element. Space `O(n)` for up to `n + 1` distinct prefix sums.

## Edge cases

- `k = 0`: every pair of equal prefix sums is a zero-sum subarray. The seeded `0 → 1` catches subarrays that start at index 0.
- Negative values: they are the whole reason prefix sums are needed; the method doesn't care about sign.
- All zeros with `k = 0`: every subarray counts, `n(n + 1) / 2` in total, and the counts in the map produce exactly that.
- A single element equal to `k`: counted via the seeded empty prefix.

## Common mistakes

- Using a sliding window, which fails on negative numbers.
- Forgetting to seed the map with `0 → 1`, which misses every subarray that starts at index 0.
- Storing whether a prefix was seen (a set) instead of how many times, which undercounts.
- Recording the current prefix before the lookup.

## In the interview

- Ask whether values can be negative. If not, a sliding window also works.
- Present the brute force, then the identity `sum(j+1..i) = prefix[i] − prefix[j]`, then "so I need to count earlier prefixes equal to `prefix[i] − k`".
- Likely follow-ups:
  - *Longest subarray with sum `k`?* Store the **first index** of each prefix sum instead of a count (as in Longest Subarray with Zero Sum).
  - *Subarray sum divisible by `k`?* Key the map by `prefix mod k`, normalised to be non-negative.
  - *2-D version (submatrices summing to `k`)?* Fix a pair of rows, collapse columns into one array, and run this algorithm on it.
