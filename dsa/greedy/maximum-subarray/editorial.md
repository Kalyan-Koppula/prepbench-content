**Key idea:** scan once, keeping the best sum of a subarray that **ends at the current element**. At each element, either extend the previous run or start fresh here, whichever is larger. A run with a negative sum can only make whatever follows smaller, so it is dropped. The answer is the best value seen at any position. This is Kadane's algorithm.

## Recognising the pattern

"Best contiguous subarray" with a running total is the textbook greedy-meets-DP problem, described in the [Greedy](/problems/patterns/greedy) sheet. Formally it is a 1-D DP (`endingHere[i] = max(nums[i], endingHere[i − 1] + nums[i])`); the greedy view is "drop a prefix as soon as its sum turns negative".

## Brute force

Try every start `i`, extend the end `j`, and keep a running sum so each subarray costs `O(1)`. That is the reference brute force below. Time `O(n²)`, space `O(1)`.

## Kadane's algorithm

1. `current = best = nums[0]`.
2. For each later `x`:
   1. `current = max(x, current + x)`: extend the run, or restart at `x`.
   2. `best = max(best, current)`.
3. Return `best`.

**Why restarting is safe.** If the best subarray ending at `i − 1` has a negative sum, any subarray ending at `i` that includes it is beaten by starting at `i` instead. If it is non-negative, extending never hurts. Either way, `current` is the best sum ending at `i`.

**Why start at `nums[0]` and not 0.** If every number is negative, the answer is the largest single element, not 0 (the subarray must be non-empty).

## Walkthrough

`nums = [3, −4, 5, −1, 2, −6, 1]`

| x | extend | restart | current | best |
| --- | --- | --- | --- | --- |
| 3 | – | – | 3 | 3 |
| −4 | −1 | −4 | −1 | 3 |
| 5 | 4 | 5 | 5 | 5 |
| −1 | 4 | −1 | 4 | 5 |
| 2 | 6 | 2 | 6 | 6 |
| −6 | 0 | −6 | 0 | 6 |
| 1 | 1 | 1 | 1 | 6 |

Answer `6`, the subarray `[5, −1, 2]`.

## Complexity

- All subarrays with running sums: `O(n²)` time.
- Divide and conquer (best on the left, on the right, or crossing the middle): `O(n log n)`.
- Kadane: `O(n)` time, `O(1)` space.

## Edge cases

- All negative: the largest element.
- One element: that element.
- Zeros: they neither help nor hurt; ties don't matter for the sum.

## Common mistakes

- Starting `best` at 0, wrong for all-negative input.
- Resetting `current` to 0 instead of to `x`, which also breaks all-negative input.
- Updating `best` before `current`.

## In the interview

- Explain the "negative prefix never helps" argument; that is the proof.
- Likely follow-ups:
  - *Return the subarray?* Record where the current run started when you restart, and the start and end when `best` improves.
  - *Circular array?* The answer is either the normal maximum or the total minus the minimum subarray (unless every number is negative).
  - *Maximum product?* Track the minimum too, since a negative flips it ([Maximum Product Subarray](/problems/maximum-product-subarray)).
  - *Divide and conquer?* Mention the `O(n log n)` version; interviewers sometimes ask for it.
