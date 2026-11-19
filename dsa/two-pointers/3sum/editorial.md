**Key idea:** sort the array. Fix the first value `nums[i]`, then the problem becomes "find pairs in the rest that sum to `-nums[i]`", which a two-pointer sweep over the sorted suffix solves in linear time. Skipping repeated values at each level keeps the triplets distinct.

## Recognising the pattern

A fixed number of elements that must hit a target sum, with duplicates to avoid: sort first, fix all but two, and finish with the opposite-ends sweep from the [Two Pointers](/problems/patterns/two-pointers) sheet. Sorting does two jobs here: it enables the sweep, and it puts equal values next to each other so duplicates are easy to skip.

## Brute force

Try every triple `i < j < k`. When the sum is 0, sort the three values, build a key like `"-1,0,1"`, and keep the triplet only if the key is new. That is the reference brute force below.

Correct because it checks every triple and deduplicates by value. Time `O(n³)`, space `O(t)` for the `t` triplets found. With `n = 3000` that is about 4.5 billion triples.

## Better: hash set for the third value

Fix `i` and `j`, and look up `-(nums[i] + nums[j])` in a set of values seen between them. Time `O(n²)`, but deduplicating triplets still needs a set of keys, and the code is messier than the sorted version.

## Optimal: sort, fix one, sweep the rest

1. Sort a copy of the array.
2. For each `i` from 0 to `n - 3`:
   1. If `sorted[i] > 0`, stop. The two values to its right are at least as large, so no sum can reach 0.
   2. If `sorted[i]` equals `sorted[i - 1]`, skip it. That first value has already been fully explored.
   3. Set `left = i + 1`, `right = n - 1`. While `left < right`:
      - If the sum is below 0, `left++`. If above, `right--`.
      - If it is 0, record the triplet, move both pointers inward, then keep moving `left` past copies of the value just used, and `right` likewise.
3. Return the triplets.

**Why the duplicate skips are enough.** A triplet is fixed by its values, and after sorting it is fixed by its smallest value, then its middle one. Using each distinct first value once, and each distinct `left` value once per first value, produces every distinct triplet exactly once.

## Walkthrough

`nums = [-1, 0, 1, 2, -1, -4]`, sorted `[-4, -1, -1, 0, 1, 2]`

| i (value) | left, right | sum | action | found |
| --- | --- | --- | --- | --- |
| 0 (−4) | 1, 5 | −3 | left+ | |
| | 2, 5 | −3 | left+ | |
| | 3, 5 | −2 | left+ | |
| | 4, 5 | −1 | left+ → meet | |
| 1 (−1) | 2, 5 | 0 | record, move both, skip | [−1, −1, 2] |
| | 3, 4 | 0 | record, move both | [−1, 0, 1] |
| 2 (−1) | – | – | same as previous value → skip | |
| 3 (0) | 4, 5 | 3 | right− → meet | |

Answer `[[-1, -1, 2], [-1, 0, 1]]`.

## Complexity

- Brute force: time `O(n³)`, space `O(t)`.
- Sort plus sweep: time `O(n²)`: the sort is `O(n log n)`, and for each of `n` first values the sweep is `O(n)`. Space `O(n)` for the sorted copy (or `O(1)` beyond the output if sorting in place is allowed).

## Edge cases

- All zeros, like `[0, 0, 0, 0]`: exactly one triplet, `[0, 0, 0]`, thanks to the skips.
- No triplet: return an empty list.
- All positive or all negative: the early stop or the sweep finds nothing.
- Many duplicates, like `[-2, 0, 0, 2, 2]`: `[-2, 0, 2]` appears once.

## Common mistakes

- Skipping duplicates by comparing `sorted[i]` with `sorted[i + 1]`, which skips the first copy and loses triplets like `[-1, -1, 2]`.
- Forgetting to skip duplicates after a match, so the same triplet is recorded several times.
- Deduplicating with a set of stringified triplets on top of the sorted solution. It works, but it hides that the skips already guarantee uniqueness.
- Sorting the caller's array in place without mentioning it.

## In the interview

- Clarify that triplets are unique by value, not by position.
- Explain "sort, fix one, two-sum the rest", then spend a sentence on each duplicate skip. That is where most bugs live.
- Likely follow-ups:
  - *Target other than 0?* Compare against `target - sorted[i]`; the early `> 0` stop must then be removed or adjusted.
  - *Closest sum to a target?* Same sweep, tracking the smallest absolute difference (3Sum Closest).
  - *Four numbers?* Add one more fixed loop: `O(n³)` (4Sum).
