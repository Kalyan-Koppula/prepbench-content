**Key idea:** at most **two** values can occur more than `n / 3` times, since three such values would need more than `n` elements. Run the Boyer-Moore vote with two candidates, cancelling three different values at a time, then count the two candidates for real and keep those above the threshold.

## Recognising the pattern

It is the same question as Majority Element with a lower bar, and the same follow-up: `O(1)` extra space. A count map from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet answers it in linear time and space. The constant-space answer generalises the voting trick: to find values above `n / k`, keep `k - 1` candidates.

## Brute force

Count with a map, then return every value whose count is above `floor(n / 3)`. That is the reference brute force below. Time `O(n)`, space `O(n)` for the map. (The truly naive version counts each value with a full scan, in `O(n²)`.)

## Optimal: voting with two candidates

The single-candidate vote cancels **pairs** of different values. Here you cancel **triples**: whenever a value differs from both candidates and both have a positive count, it knocks one off each. A cancelled triple contains three different values, so it removes at most one copy of any value that occurs more than `n / 3` times. Such a value has more copies than one third of everything, so it can't be fully cancelled, and it must be holding one of the two candidate slots at the end.

1. `candidate1 = 0, count1 = 0, candidate2 = 1, count2 = 0`. Starting the candidates at different values stops them from ever being equal.
2. For each `x`:
   1. If `x` equals `candidate1`, increment `count1`.
   2. Else if `x` equals `candidate2`, increment `count2`.
   3. Else if `count1` is 0, take `x` as `candidate1` with count 1.
   4. Else if `count2` is 0, take `x` as `candidate2` with count 1.
   5. Else decrement both counts.
3. Count the real occurrences of both candidates in a second pass.
4. Return each candidate whose count is above `floor(n / 3)`.

**Order matters in step 2.** Check "equals a candidate" before "slot is empty". Otherwise a value that already holds slot 2 could also be placed into an empty slot 1, and you'd have the same value twice.

**Why the second pass?** The vote guarantees that every qualifying value ends up as a candidate, but not that every candidate qualifies. With `[1, 2, 3]`, the last candidate standing appears only once.

## Walkthrough

`nums = [1, 1, 1, 3, 3, 2, 2, 2]`, `n = 8`, threshold `floor(8 / 3) = 2`.

| x | c1 (count) | c2 (count) | action |
| --- | --- | --- | --- |
| 1 | 1 (1) | – (0) | take slot 1 |
| 1 | 1 (2) | – (0) | match 1 |
| 1 | 1 (3) | – (0) | match 1 |
| 3 | 1 (3) | 3 (1) | take slot 2 |
| 3 | 1 (3) | 3 (2) | match 2 |
| 2 | 1 (2) | 3 (1) | cancel both |
| 2 | 1 (1) | 3 (0) | cancel both |
| 2 | 1 (1) | 2 (1) | take slot 2 |

Candidates `1` and `2`. Real counts: `1` appears 3 times, `2` appears 3 times, both above 2. Answer `[1, 2]`.

## Complexity

- Brute force with a map: time `O(n)`, space `O(n)`.
- Two-candidate vote: time `O(n)` for two passes. Space `O(1)`.

## Edge cases

- No value qualifies, like `[1, 2, 3]`: the verification pass rejects both candidates, so return `[]`.
- One value qualifies: only one candidate survives verification.
- Fewer than three elements: every distinct value appears more than `floor(n / 3)` times. For `[1, 2]` the threshold is 0, so both count.
- All values equal: only one candidate is ever used.

## Common mistakes

- Skipping the verification pass.
- Initialising both candidates to the same value, which can make them collide and return a value twice.
- Testing "slot empty" before "matches a candidate".
- Using `n / 3` without the floor, or `>=` instead of `>`.

## In the interview

- Start with the map solution, then say: "At most two values can exceed `n / 3`, so I can generalise Boyer-Moore to two candidates in constant space."
- Explain the triple-cancellation argument and why the second pass is still needed.
- Likely follow-ups:
  - *More than `n / k` in general?* Keep `k - 1` candidates. Time `O(n · k)`, space `O(k)`.
  - *Streaming with limited memory?* This is the Misra-Gries summary, which finds all frequent items with `k - 1` counters.
