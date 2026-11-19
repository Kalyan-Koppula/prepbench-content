**Key idea:** "exactly `k` distinct" is awkward to slide, because shrinking a window can drop it from `k` to `k − 1` distinct. "At most `k` distinct" slides perfectly. So count the subarrays with at most `k` distinct values, subtract those with at most `k − 1`, and what remains is exactly `k`.

## Recognising the pattern

Counting subarrays with a distinct-value condition points to the [Sliding Window](/problems/patterns/sliding-window) sheet, but the condition "exactly `k`" isn't monotone: neither growing nor shrinking a window keeps it valid. The standard fix is the **at-most trick**: `exactly(k) = atMost(k) − atMost(k − 1)`, where each `atMost` is an ordinary longest-window pass.

## Brute force

For each start, extend the end while adding values to a set. Count the subarray when the set has exactly `k` values, and stop once it has more. That is the reference brute force below.

Correct because it checks every subarray that could qualify. Time `O(n²)`, space `O(n)` for the set.

## Optimal: two "at most" windows

**Counting with one window.** For "at most `limit` distinct", run the longest-window template: add `nums[right]`, then shrink from the left until the map has at most `limit` keys. Now every subarray that ends at `right` and starts anywhere in `[left, right]` is valid, which is `right − left + 1` subarrays. Add that to the total.

**Why subtraction works.** Every subarray with at most `k` distinct values has either exactly `k` or at most `k − 1`. Those two groups don't overlap, so `atMost(k) − atMost(k − 1)` counts exactly the subarrays with `k` distinct values.

1. Write `countAtMost(nums, limit)` as above, with a count map and deletion of zero counts.
2. Return `countAtMost(nums, k) − countAtMost(nums, k − 1)`.

When `limit` is 0, the window must be empty, so `countAtMost(nums, 0)` correctly returns 0.

## Walkthrough

`nums = [1, 2, 1, 2, 3]`, `k = 2`

At most 2 distinct:

| right | value | window after shrink | added | running total |
| --- | --- | --- | --- | --- |
| 0 | 1 | [0,0] | 1 | 1 |
| 1 | 2 | [0,1] | 2 | 3 |
| 2 | 1 | [0,2] | 3 | 6 |
| 3 | 2 | [0,3] | 4 | 10 |
| 4 | 3 | [3,4] (drop until {2, 3}) | 2 | 12 |

At most 1 distinct: windows are `[0,0]`, `[1,1]`, `[2,2]`, `[3,3]`, `[4,4]`, adding 1 each, total `5`.

Answer `12 − 5 = 7`: `[1,2]`, `[2,1]`, `[1,2]`, `[2,3]`, `[1,2,1]`, `[2,1,2]`, `[1,2,1,2]`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Two windows: time `O(n)`, two linear passes. Space `O(k)`: each map holds at most `k + 1` keys.

## Edge cases

- `k = 1`: count runs of equal values; `countAtMost(…, 0)` is 0.
- `k` larger than the number of distinct values: no subarray qualifies, and the two `atMost` counts are equal.
- All values equal: only `k = 1` gives a non-zero answer, `n(n + 1) / 2`.

## Common mistakes

- Trying to slide one window for "exactly `k`" directly and undercounting subarrays whose start could move further.
- Adding 1 per valid window instead of `right − left + 1`.
- Leaving zero counts in the map so its size overstates the distinct values.

## In the interview

- Explain why "exactly" isn't monotone, then introduce the subtraction. That is the insight being tested.
- Likely follow-ups:
  - *Exactly `k` odd numbers, or a sum of exactly `k` in a binary array?* The same subtraction trick with a different counter.
  - *One pass instead of two?* Track two left pointers, one for "at most `k`" and one for "at most `k − 1`", and add the gap between them at each step.
