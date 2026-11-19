**Key idea:** repeatedly replacing a number by the sum of the squares of its digits always ends in a **cycle**: either the fixed point 1 (happy) or a loop that never reaches 1. So this is cycle detection. Run two pointers through the sequence, one twice as fast as the other. If the fast one reaches 1, the number is happy; if they meet first, it is stuck in a loop.

## Recognising the pattern

A sequence where each value is computed from the previous one, over a finite set of values, must eventually repeat. Detecting that repeat is Floyd's cycle detection, from the [Linked List](/problems/patterns/linked-list) sheet, applied to numbers instead of nodes. The [Math & Geometry](/problems/patterns/math-geometry) sheet covers the digit arithmetic.

## Alternative: remember what you've seen (shown below)

Keep a set of every number visited. Stop when you reach 1 or see a number again. That is the reference brute force below, and it is the most common interview answer. `O(k)` time and `O(k)` space, where `k` is the number of steps before a repeat.

**Why the sequence can't grow forever.** A number with `d` digits has a digit-square sum of at most `81 · d`. For any number of 4 or more digits that is smaller than the number itself, so the sequence drops quickly into the range below 1000 and stays there. With finitely many values, it must repeat.

## Floyd's tortoise and hare

1. `slow = n`, `fast = next(n)`.
2. While `fast ≠ 1` and `slow ≠ fast`: `slow = next(slow)`, `fast = next(next(fast))`.
3. Return `fast === 1`.

`next(x)` takes digits with `x % 10` and `x / 10` (integer division) and sums their squares.

**Why they meet.** Once both are inside the cycle, the gap between them shrinks by one each step, so they meet within one lap. If 1 is reached, it is its own cycle (`next(1) = 1`), and the fast pointer gets there first.

## Walkthrough

`n = 7`. The sequence is 7 → 49 → 97 → 130 → 10 → 1.

| step | slow | fast |
| --- | --- | --- |
| start | 7 | 49 |
| 1 | 49 | 130 |
| 2 | 97 | 1 |

`fast = 1`: happy. For `n = 4`, the sequence enters the loop 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4, the pointers meet inside it, and the answer is `false`.

## Complexity

- Set of seen values: `O(k)` time and space, with each step `O(log n)` for the digits.
- Floyd: the same `O(k)` steps, `O(1)` space.

## Edge cases

- `n = 1`: happy immediately.
- Powers of 10 (`10`, `100`): happy in one step.
- Large starting values: they shrink within a few steps.

## Common mistakes

- Looping until 1 with no cycle check, which never ends for unhappy numbers.
- Starting `slow` and `fast` at the same value with a `while (slow !== fast)` loop, which exits immediately.
- Using string conversion for the digits in an interview; `% 10` and `/ 10` are clearer and language-neutral.

## In the interview

- Explain why a cycle must occur, then offer the set first and Floyd as the `O(1)`-space version.
- Likely follow-ups:
  - *Where does the cycle start?* Floyd's second phase: reset one pointer to the start and move both one step at a time.
  - *Linked List Cycle?* The same algorithm on nodes.
