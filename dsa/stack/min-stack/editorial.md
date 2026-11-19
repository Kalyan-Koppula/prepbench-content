**Key idea:** store, next to every value, the minimum of the stack **up to and including** that value. When you push, the new minimum is `min(val, previous minimum)`. When you pop, the minimum below is already stored. Every operation is `O(1)`.

## Recognising the pattern

The difficulty is `getMin` after a pop: if the minimum is popped, what was the minimum before it? A stack only changes at the top, so the answer for every height of the stack can be computed once, at push time, and stored alongside. This "remember extra state per level" idea is a key trick in the [Stack](/problems/patterns/stack) sheet.

## Brute force

Keep a plain array. `push`, `pop` and `top` are `O(1)`; `getMin` scans the whole array. That is the reference brute force below.

Correct, but `getMin` is `O(n)`, which breaks the requirement.

## Optimal: a parallel stack of running minimums

Keep two arrays of equal length:

- `values[i]` is the element at height `i`.
- `mins[i]` is the smallest of `values[0..i]`.

Operations:

1. `push(val)`: append `val` to `values`. Append `val` to `mins` if it is empty, otherwise `min(val, mins[top])`.
2. `pop()`: remove the last element of both arrays.
3. `top()`: return the last element of `values`.
4. `getMin()`: return the last element of `mins`.

Why it is correct: `mins[i]` depends only on elements at heights `0..i`. Popping never changes those, so the value stored under the new top is still exactly right.

**Space-saving variant.** Push onto `mins` only when `val <= current min`, and pop from `mins` only when the popped value equals the current min. Using `<=` (not `<`) matters: with duplicates of the minimum, each copy needs its own entry, or popping one copy would lose the minimum while another is still there.

## Walkthrough

| operation | values | mins | returns |
| --- | --- | --- | --- |
| push(5) | [5] | [5] | |
| push(2) | [5, 2] | [5, 2] | |
| push(4) | [5, 2, 4] | [5, 2, 2] | |
| getMin() | | | 2 |
| pop() | [5, 2] | [5, 2] | |
| pop() | [5] | [5] | |
| getMin() | | | 5 |
| top() | | | 5 |

## Complexity

- Brute force: `getMin` is `O(n)`, everything else `O(1)`. Space `O(n)`.
- Parallel stack: every operation `O(1)`. Space `O(n)` for the second array (less in the variant when values mostly increase).

## Edge cases

- Duplicate minimums, like pushing 2, 2 and popping once: the minimum must still be 2. The parallel stack handles this automatically.
- Decreasing pushes: `mins` mirrors `values`.
- Negative numbers and very large values: plain comparisons, no special handling.

## Common mistakes

- Keeping one `min` variable and not knowing what to restore after popping the minimum.
- In the space-saving variant, pushing onto `mins` only when `val < min`, which breaks with duplicates.
- Computing the new minimum from `values` instead of the previous `mins` entry.

## In the interview

- Explain why a single variable isn't enough, then the per-level minimum.
- Likely follow-ups:
  - *Max stack with `popMax`?* Harder: a sorted structure (or a heap with lazy deletion) plus a doubly linked list.
  - *Minimum of a queue?* Build the queue from two min-stacks, or use a monotonic deque.
  - *`O(1)` extra space?* Store encoded differences (`val - min`) on one stack. It works, but watch for overflow in fixed-width languages.
