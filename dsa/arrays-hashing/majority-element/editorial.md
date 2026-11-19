**Key idea:** cancel out pairs of **different** values. Every cancellation removes at most one copy of the majority value, but the majority has more copies than everything else combined, so it is the value left standing. A running `candidate` and `count` do this in one pass with `O(1)` memory.

## Recognising the pattern

Counting with a hash map solves it in linear time, which is the default move from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The follow-up asks for `O(1)` extra space, and that is the signal for the Boyer-Moore voting algorithm: a counting trick that works only because "more than half" is guaranteed.

## Brute force

For each value, count how many times it appears by scanning the whole array. Return the first one whose count is above `n / 2`.

Correct because it checks every candidate directly. Time `O(n²)`, space `O(1)`.

## Better: hash map or sorting

- Count every value in a map, then return the one whose count exceeds `n / 2`. Time `O(n)`, space `O(n)`.
- Or sort: the majority value fills more than half the array, so it always covers the middle index. Return `sorted[floor(n / 2)]`. Time `O(n log n)`.

## Optimal: Boyer-Moore voting

Imagine pairing each copy of the majority with a copy of some other value and throwing the pair away. Since the majority has more copies than all other values together, some of its copies are left over. The algorithm simulates this pairing on the fly.

1. Start with `count = 0`.
2. For each value `x`:
   1. If `count` is 0, make `x` the new `candidate`.
   2. If `x` equals `candidate`, increment `count`; otherwise decrement it.
3. Return `candidate`.

**Why it works.** A decrement means one copy of `candidate` and one copy of `x` (a different value) cancel. When `count` drops to 0, the prefix so far has been split into cancelled pairs, so no value has a majority **within that prefix**. That means the true majority still has a majority in the remaining suffix, and the argument repeats on it. At the end, only the majority can still hold a positive count.

Note that the result is only guaranteed because a majority is promised. Without that promise you would need a second pass to verify the count.

## Walkthrough

`nums = [2, 2, 1, 1, 1, 2, 2]`

| i | x | before | action | candidate | count |
| --- | --- | --- | --- | --- | --- |
| 0 | 2 | count 0 | pick 2 | 2 | 1 |
| 1 | 2 | | same | 2 | 2 |
| 2 | 1 | | cancel | 2 | 1 |
| 3 | 1 | | cancel | 2 | 0 |
| 4 | 1 | count 0 | pick 1 | 1 | 1 |
| 5 | 2 | | cancel | 1 | 0 |
| 6 | 2 | count 0 | pick 2 | 2 | 1 |

Answer `2`, which appears 4 times out of 7.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Hash map: time `O(n)`, space `O(n)`.
- Sorting: time `O(n log n)`, space depends on the sort.
- Boyer-Moore: time `O(n)`, one pass. Space `O(1)`, two variables.

## Edge cases

- A single element: it is the majority.
- All values equal: the count only grows.
- The majority is negative or very large: comparisons don't care about magnitude.
- The candidate changes several times before settling, as in the walkthrough. That is expected.

## Common mistakes

- Using Boyer-Moore without verification when a majority isn't guaranteed.
- Checking `count === 0` **after** updating the count, which picks the wrong candidate.
- Comparing the count against `n / 2` with `>=`, which accepts exactly half.

## In the interview

- Offer the hash map first, then: "With the guarantee of a strict majority, I can do it in constant space by cancelling pairs of different values."
- Explain the cancellation argument in one or two sentences. That is what interviewers want to hear.
- Likely follow-ups:
  - *No guarantee a majority exists?* Run the vote, then count the candidate in a second pass.
  - *Values occurring more than `n / 3` times?* At most two such values exist, so track two candidates (Majority Element II).
  - *Data split across machines?* Run the vote per chunk, then combine `(candidate, count)` pairs with the same cancellation rule, and verify.
