**Key idea:** run the standard next-greater monotonic stack, but walk the array **twice**. The second lap lets elements near the end find a greater value near the start, which is exactly the wrap-around. Only the first lap pushes indices; the second lap only answers.

## Recognising the pattern

"First greater element moving forward" is the next-greater-element problem from the [Stack](/problems/patterns/stack) sheet. The circular twist is handled with the standard trick for circular arrays: pretend the array is concatenated with itself and index with `i % n`.

## Brute force

For each index, check the next `n − 1` positions with wrap-around, and take the first greater value (or −1). That is the reference brute force below.

Correct by definition. Time `O(n²)`, space `O(1)` beyond the output.

## Optimal: monotonic stack over two laps

1. `result` = all −1; `stack` = empty stack of indices.
2. For `i` from 0 to `2n − 1`, with `value = nums[i % n]`:
   1. While the index on top of the stack has a smaller value than `value`, pop it and set its result to `value`.
   2. If `i < n`, push `i`.
3. Return `result`.

**Why two laps are enough.** Every element's search covers at most the `n − 1` positions after it, wrapping once. By the end of the second lap, every element has been compared against every position in that range. Elements that are never popped are global maxima (or tied with one) and correctly keep −1.

**Why not push in the second lap?** Each index already has its own entry from the first lap. Pushing again would create duplicates that could overwrite answers or keep the stack from emptying.

## Walkthrough

`nums = [1, 2, 1]`, `n = 3`

| i | i % n | value | popped → result | stack after (indices) |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1 | – | [0] |
| 1 | 1 | 2 | 0 → 2 | [1] |
| 2 | 2 | 1 | – | [1, 2] |
| 3 | 0 | 1 | – (1 is not greater than 1) | [1, 2] |
| 4 | 1 | 2 | 2 → 2 | [1] |
| 5 | 2 | 1 | – | [1] |

Answer `[2, -1, 2]`. Index 1 holds the maximum, so it stays −1. Index 2 found its answer only on the second lap, by wrapping.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Two-lap stack: time `O(n)`, `2n` iterations with each index pushed and popped at most once. Space `O(n)`.

## Edge cases

- All values equal: nothing is strictly greater, so every answer is −1.
- A single element: −1.
- The maximum appears more than once: every copy keeps −1.
- Strictly increasing values: each element is answered by its right neighbour; the last one is the maximum, so it keeps −1.

## Common mistakes

- Walking only one lap and missing the wrap-around answers.
- Pushing indices on the second lap.
- Pushing values instead of indices, so you can't tell which result to fill in.
- Using `<=` when popping, which treats equal values as greater.

## In the interview

- Say "next greater element with the array doubled", and explain why you don't actually build the doubled array.
- Likely follow-ups:
  - *Non-circular version with a subset query (Next Greater Element I)?* Run the stack once on the second array and store answers in a map for the queried values.
  - *Distance instead of value?* Store `(i - index + n) % n` when popping.
