**Key idea:** a subarray sums to zero exactly when the prefix sums at its two ends are equal. Scan once, remember the **first** index where each prefix sum appeared, and whenever a sum repeats, the gap since its first sighting is a zero-sum subarray.

## Recognising the pattern

A contiguous range with a sum condition, and values that can be negative: a sliding window won't work, because shrinking doesn't reliably move the sum in one direction. This is the prefix-sum-plus-map tool from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet, in its "longest" form: store the earliest index for each prefix sum rather than a count.

## Brute force

For each start, extend the end with a running sum and record the length whenever the sum is 0. That is the reference brute force below.

Correct because it checks every subarray. Time `O(n²)`, space `O(1)`. For `n = 10^5` that is 5 billion steps, far too slow.

## Optimal: first index of each prefix sum

Let `prefix[i]` be the sum of `nums[0..i]`, and `prefix[-1] = 0`. The subarray `j + 1 .. i` sums to `prefix[i] - prefix[j]`, which is 0 exactly when `prefix[i] == prefix[j]`. For a fixed `i`, the longest such subarray uses the **smallest** `j` with the same prefix sum.

1. Create a map `firstIndex` with `0 → -1`, so a zero-sum prefix starting at index 0 has length `i - (-1) = i + 1`.
2. Set `sum = 0`, `best = 0`.
3. For each `i`:
   1. `sum += nums[i]`.
   2. If `sum` is in the map, the subarray from `firstIndex[sum] + 1` to `i` sums to 0. Update `best` with `i - firstIndex[sum]`.
   3. Otherwise store `firstIndex[sum] = i`.
4. Return `best`.

**Only store the first sighting.** A later index with the same sum could only produce shorter subarrays for every future `i`, so overwriting it would lose the answer.

## Walkthrough

`nums = [15, -2, 2, -8, 1, 7, 10, 23]`

| i | value | sum | seen before? | length | best | map adds |
| --- | --- | --- | --- | --- | --- | --- |
| – | – | 0 | – | – | 0 | 0 → −1 |
| 0 | 15 | 15 | no | – | 0 | 15 → 0 |
| 1 | −2 | 13 | no | – | 0 | 13 → 1 |
| 2 | 2 | 15 | yes, at 0 | 2 | 2 | – |
| 3 | −8 | 7 | no | – | 2 | 7 → 3 |
| 4 | 1 | 8 | no | – | 2 | 8 → 4 |
| 5 | 7 | 15 | yes, at 0 | 5 | 5 | – |
| 6 | 10 | 25 | no | – | 5 | 25 → 6 |
| 7 | 23 | 48 | no | – | 5 | 48 → 7 |

Answer `5`: the subarray `[-2, 2, -8, 1, 7]` from index 1 to 5.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- First-index map: time `O(n)` on average, one lookup per element. Space `O(n)` for up to `n + 1` distinct sums.

## Edge cases

- No zero-sum subarray: no sum ever repeats, so return `0`.
- A zero-sum prefix, like `[1, -1, 5]`: the seeded `0 → -1` gives length 2.
- The whole array sums to zero: the final sum is 0, matched against `-1`, giving `n`.
- Single zeros, like `[3, 0, 4]`: the sum repeats at the zero, giving length 1.

## Common mistakes

- Forgetting the seed `0 → -1`, which misses zero-sum subarrays that start at index 0.
- Overwriting the stored index on every sighting, which keeps the latest index and returns shorter answers.
- Computing the length as `i - j + 1` with `j` being the stored index. The subarray starts at `j + 1`, so the length is `i - j`.

## In the interview

- Explain the prefix identity in one sentence, then why the first index gives the longest subarray.
- Mention the seed explicitly; it is the detail most people forget.
- Likely follow-ups:
  - *Longest subarray with sum `k`?* Look up `sum - k` instead of `sum`, same first-index map.
  - *Equal numbers of 0s and 1s?* Replace each 0 with −1; the question becomes longest zero-sum subarray.
  - *Count the zero-sum subarrays instead?* Store counts per prefix sum, as in Subarray Sum Equals K.
