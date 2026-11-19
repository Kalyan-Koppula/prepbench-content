**Key idea:** keep a `write` pointer for where the next non-zero belongs. Read the array left to right; every non-zero is swapped to `write` and `write` moves on. Non-zeros keep their order, and the zeros collect at the end automatically.

## Recognising the pattern

You are **compacting** an array in place: keep some elements in order, push the rest to the end. That is the read/write pointer variant from the [Two Pointers](/problems/patterns/two-pointers) sheet, where both pointers move in the same direction and the slow one marks the end of the "kept" region.

## Brute force

Copy the non-zeros into a new array, in order. Write them back to the start of `nums`, then fill the rest with zeros. That is the reference brute force below.

Correct and linear: time `O(n)`, space `O(n)`. The statement asks you not to make a copy, so it is only a stepping stone.

## Optimal: read and write pointers with swaps

Keep two regions behind the `read` pointer:

```
[0, write)       non-zeros seen so far, in original order
[write, read)    zeros
```

1. `write = 0`.
2. For `read` from 0 to `n - 1`:
   1. If `nums[read]` is non-zero, swap `nums[read]` with `nums[write]` and increment `write`.
3. Done.

When a non-zero is found, `nums[write]` is either the same cell (no zeros seen yet) or a zero. Swapping puts the non-zero at the end of the kept region and moves the zero to the end of the zeros region, so both regions stay correct. Skipping the swap when `read == write` avoids pointless writes.

**Alternative with fewer swaps.** Copy each non-zero to `write` (no swap), then fill `nums[write..]` with zeros at the end. Both are `O(n)`. The swap version writes less when there are few zeros; the copy version writes less when there are many.

## Walkthrough

`nums = [0, 1, 0, 3, 12]`

| read | value | action | write after | array |
| --- | --- | --- | --- | --- |
| 0 | 0 | skip | 0 | [0, 1, 0, 3, 12] |
| 1 | 1 | swap 1 ↔ 0 | 1 | [1, 0, 0, 3, 12] |
| 2 | 0 | skip | 1 | [1, 0, 0, 3, 12] |
| 3 | 3 | swap 1 ↔ 3 | 2 | [1, 3, 0, 0, 12] |
| 4 | 12 | swap 2 ↔ 4 | 3 | [1, 3, 12, 0, 0] |

## Complexity

- Copy: time `O(n)`, space `O(n)`.
- Read/write pointers: time `O(n)`, one pass. Space `O(1)`.

## Edge cases

- No zeros: every swap is skipped because `read == write`, so nothing changes.
- All zeros: `write` never moves and nothing changes.
- A single element: nothing to do.
- Negative numbers: only "zero or not" matters.

## Common mistakes

- Removing zeros with `splice` and pushing them back. Each splice shifts the rest of the array, so it is `O(n²)`.
- Swapping zeros toward the end with adjacent swaps, which also turns quadratic.
- Breaking the relative order of the non-zeros, for example by swapping with the last element.

## In the interview

- State the two regions and what each pointer means before writing code.
- Mention the write-count follow-up and both variants.
- Likely follow-ups:
  - *Remove all copies of a value and return the new length?* Same read/write loop, no zeros to fill (Remove Element).
  - *Remove duplicates from a sorted array?* Same idea; write a value only when it differs from the last written one.
  - *Move zeros to the front instead?* Run the same loop from the right end.
