**Key idea:** every round needs the two heaviest stones, and the result of a collision goes back into the pile. A max-heap gives the heaviest stone in `O(log n)` and accepts new stones in `O(log n)`, so the whole simulation is fast.

## Recognising the pattern

"Repeatedly take the best items, combine them, and put the result back" is the plain-heap simulation from the [Heap](/problems/patterns/heap) sheet. Sorting once doesn't help, because the remainders change the order.

## Brute force

Each round, scan the pile for the heaviest stone and remove it, then scan again for the second heaviest. Push back the difference if it is positive. That is the reference brute force below. Each round is `O(n)` and there are up to `n` rounds: `O(n²)`.

(Re-sorting the pile every round is `O(n² log n)`.)

## Optimal: max-heap simulation

1. Push every stone into a max-heap.
2. While the heap holds at least two stones:
   1. Pop `heaviest`, then pop `second`.
   2. If `heaviest > second`, push `heaviest − second`.
3. Return the remaining stone, or 0 if the heap is empty.

Each round removes at least one stone, so there are at most `n − 1` rounds.

## Walkthrough

`stones = [2, 7, 4, 1, 8, 1]`

| round | heaviest, second | pushed back | pile after |
| --- | --- | --- | --- |
| 1 | 8, 7 | 1 | 4, 2, 1, 1, 1 |
| 2 | 4, 2 | 2 | 2, 1, 1, 1 |
| 3 | 2, 1 | 1 | 1, 1, 1 |
| 4 | 1, 1 | – | 1 |

Answer `1`.

## Complexity

- Linear scans: time `O(n²)`, space `O(n)` for the copy.
- Max-heap: time `O(n log n)`, space `O(n)`.

## Edge cases

- One stone: return it.
- Two equal stones: both disappear, return 0.
- All stones equal: they cancel in pairs; the answer is that weight if the count is odd, otherwise 0.

## Common mistakes

- Using a min-heap.
- Pushing back 0 when the stones are equal.
- Sorting once at the start and ignoring the remainders.

## In the interview

- One sentence: "a max-heap simulates the rounds directly."
- Likely follow-ups:
  - *Smash any two stones, minimise what is left (Last Stone Weight II)?* That's a different problem: split the stones into two groups with sums as close as possible, a knapsack DP.
  - *Weights bounded by 1000?* Counting sort with buckets would also work, scanning down from the top bucket.
