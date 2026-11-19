**Key idea:** always place the letter with the most copies left, as long as it differs from the letter you just placed. A max-heap by remaining count picks it, and the previous letter is held back for one step. If you ever have to place the same letter twice in a row, it is impossible.

## Recognising the pattern

Greedy by frequency with a "can't use the same one twice in a row" rule is the [Heap](/problems/patterns/heap) sheet's take-and-hold-back pattern, the same idea as Task Scheduler with a cooldown of one.

A quick feasibility test comes first: if one letter appears more than `ceil(n / 2)` times, there aren't enough other letters to separate its copies.

## Alternative without a heap (shown below)

Fill even positions 0, 2, 4, … with the most frequent letter first, then keep filling even positions with the other letters, wrapping to odd positions 1, 3, 5, … when the even ones run out. Copies of a letter are placed two apart, so no two equal letters touch, provided the most frequent letter goes first and fits in the even slots. That is the reference brute force below; it is linear and a perfectly good answer.

## Heap approach

1. Count each letter. Push every letter with a non-zero count into a max-heap ordered by count.
2. `held = none`. While the heap isn't empty:
   1. Pop the most frequent letter `c` and append it.
   2. Push `held` back into the heap (it may be used again).
   3. If `c` still has copies, it becomes `held`; otherwise `held = none`.
3. If a letter is still held at the end, it couldn't be placed: return `""`. Otherwise return the string.

Holding the last letter out of the heap for exactly one step guarantees it can't be chosen twice in a row.

## Walkthrough

`s = "aaab"` (counts a:3, b:1):

| step | pop | appended | held after | heap after |
| --- | --- | --- | --- | --- |
| 1 | a (3) | a | a:2 | b:1 |
| 2 | b (1) | ab | – (b used up), a pushed back | a:2 |
| 3 | a (2) | aba | a:1 | empty |

The heap is empty but `a` is still held with one copy, so return `""`. With `s = "aab"`, the result is `"aba"`.

## Complexity

- Heap: time `O(n log 26) = O(n)`, space `O(26)`.
- Even/odd placement: time `O(n)`, space `O(n)` for the output.

## Edge cases

- One letter repeated: impossible unless the string has length 1.
- Exactly `ceil(n / 2)` copies of one letter: possible, alternating from the first position.
- All letters distinct: any order works.

## Common mistakes

- Popping the same letter twice in a row because it wasn't held back.
- Pushing back letters with zero copies.
- In the placement approach, not placing the most frequent letter first, which can put two copies next to each other.

## In the interview

- State the impossibility condition first; it shows you understand the structure.
- Likely follow-ups:
  - *Equal letters at least `k` apart?* Hold back the last `k − 1` letters in a queue instead of one (Rearrange String k Distance Apart).
  - *Count the arrangements?* A combinatorics question, much harder.
