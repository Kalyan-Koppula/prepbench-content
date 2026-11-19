**Key idea:** before the single element, every pair starts at an **even** index (`nums[0] = nums[1]`, `nums[2] = nums[3]`, …). After it, pairs start at odd indices. Look at the pair that should start at an even `mid`: if it is intact, the single element is further right; if it is broken, it is at `mid` or to the left.

## Recognising the pattern

`O(log n)` and `O(1)` space on a sorted array, but you aren't looking for a known value: you're looking for where a **pattern changes**. That is binary search on a property, from the [Binary Search](/problems/patterns/binary-search) sheet. The property "is the pair starting at this even index intact?" is true before the answer and false from the answer on.

## Brute force

Walk the array two at a time. The first pair whose two values differ starts with the single element; if every pair matches, the single element is last. That is the reference brute force below. Time `O(n)`, space `O(1)`.

(XOR of all values also finds it in `O(n)`, since pairs cancel out, but it ignores the sorted order.)

## Optimal: binary search on pair alignment

1. `lo = 0`, `hi = n − 1`.
2. While `lo < hi`:
   1. `mid = lo + floor((hi − lo) / 2)`. If `mid` is odd, subtract 1, so `mid` is where a pair should start.
   2. If `nums[mid] == nums[mid + 1]`, the pairs up to `mid + 1` are intact, so the single element is at `mid + 2` or later: `lo = mid + 2`.
   3. Otherwise the alignment is already broken: the single element is at `mid` or before. `hi = mid`.
3. Return `nums[lo]`.

**Why `lo` stays even.** It starts at 0 and only ever moves to `mid + 2` with `mid` even. `hi` is either `n − 1` (even, since `n` is odd) or an even `mid`. So the range always starts and ends on even indices, and the loop ends on the single element.

## Walkthrough

`nums = [1, 1, 2, 3, 3, 4, 4, 8, 8]`

| lo | hi | mid (made even) | pair | intact? | next |
| --- | --- | --- | --- | --- | --- |
| 0 | 8 | 4 | (3, 4) | no | hi = 4 |
| 0 | 4 | 2 | (2, 3) | no | hi = 2 |
| 0 | 2 | 0 | (1, 1) | yes | lo = 2 |

`lo = hi = 2`, so the answer is `2`.

## Complexity

- Pair walk or XOR: time `O(n)`, space `O(1)`.
- Binary search: time `O(log n)`, space `O(1)`.

## Edge cases

- One element: it is the answer.
- The single element is first, like `[1, 2, 2]`: the first pair is broken immediately.
- The single element is last, like `[1, 1, 2]`: every pair is intact, and `lo` walks to the end.

## Common mistakes

- Comparing `nums[mid]` with `nums[mid − 1]` without adjusting for parity, which mixes up the two halves.
- `lo = mid + 1` after an intact pair, which lands on an odd index and breaks the alignment argument.
- Forgetting that `n` is odd, which the alignment relies on.

## In the interview

- Explain the even/odd pairing with a small example before coding.
- Mention XOR as the linear alternative.
- Likely follow-ups:
  - *Unsorted input?* XOR all values: `O(n)` time, `O(1)` space.
  - *Every value appears three times except one?* Count each bit position modulo 3 (Single Number II).
