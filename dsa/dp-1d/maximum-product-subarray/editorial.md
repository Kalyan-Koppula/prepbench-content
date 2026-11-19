**Key idea:** scan once, tracking the largest **and** smallest product of a subarray ending at the current position. A negative number turns the smallest product into the largest and vice versa, so you need both. At each element, the new values come from the element alone, or the element times the previous largest, or times the previous smallest.

## Recognising the pattern

"Best contiguous subarray" with a running state is Kadane's algorithm from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. For sums, one running best is enough; for products, the sign flip means you must carry a second state, the minimum.

## Brute force

Try every start, extend the end, and keep the running product. That is the reference brute force below. Time `O(n²)`, space `O(1)`.

## Kadane with high and low

1. `high = low = best = nums[0]`.
2. For each later `x`:
   1. Candidates: `x`, `high · x`, `low · x`.
   2. `high` = the largest candidate, `low` = the smallest.
   3. `best = max(best, high)`.
3. Return `best`.

**Why the candidate `x` alone.** Starting fresh at `x` is better whenever the previous products would only hurt, for example after a zero, where both `high` and `low` become 0.

## Walkthrough

`nums = [2, 3, -2, 4, -1]`

| x | high | low | best |
| --- | --- | --- | --- |
| 2 | 2 | 2 | 2 |
| 3 | 6 | 3 | 6 |
| −2 | −2 | −12 | 6 |
| 4 | 4 | −48 | 6 |
| −1 | 48 | −4 | 48 |

Answer `48`: the whole array, because the two negatives cancel. Without tracking `low`, the `−48` would be lost and the final `−1` couldn't turn it into 48.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- High and low: time `O(n)`, space `O(1)`.

## Edge cases

- A single negative number: the answer is that number.
- Zeros: they reset both `high` and `low`.
- An odd number of negatives: the best subarray leaves one out.

## Common mistakes

- Tracking only the maximum, as for sums.
- Computing the new `low` from the already-updated `high`; compute both from the old values.
- Starting `best` at 0, which is wrong for arrays like `[-3]`.

## In the interview

- Explain why the minimum must be tracked, with a small example like `[−2, 3, −4]`.
- Likely follow-ups:
  - *Maximum sum subarray?* Kadane with only the maximum.
  - *Return the subarray?* Track where the current high and low runs started.
  - *Products overflow?* Use 64-bit integers, or compare logarithms of absolute values plus the sign.
