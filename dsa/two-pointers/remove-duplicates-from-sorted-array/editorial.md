**Key idea:** in a sorted array, equal values sit next to each other, so a value is new exactly when it differs from the last value you kept. A slow `write` index marks the end of the kept prefix, a fast `read` index scans ahead, and each new value is copied down to `write`.

## Recognising the pattern

Three phrases give it away: the input is **sorted**, the work must happen **in place**, and the survivors keep their **order**. That is the read/write (or "fast and slow") variant on the [Two Pointers](/problems/patterns/two-pointers) sheet. Both pointers move left to right, `read` visits every element, and `write` only advances when something is kept.

The obvious in-place approach is to delete each duplicate as you find it. Every deletion shifts the rest of the array left, so a run of many duplicates costs `O(n²)` in total. With `3 * 10^4` elements that is hundreds of millions of moves.

## Brute force

Ignore the space limit. Walk the array and push a value into a second array whenever it differs from the last value pushed. Because equal values are adjacent, that keeps exactly one copy of each. Then copy the second array back over the front of `nums` and return that prefix.

It is correct and even linear. Time `O(n)`, but space `O(n)` for the second array, which is exactly what the problem asks you to avoid. (A `Set` would give the same values, but it relies on the set keeping insertion order and still uses `O(n)` space.)

## Optimal: read and write pointers

Look at what the brute force does with its second array. It only ever appends to it, and it only ever reads its last element. Its length never exceeds the number of elements already scanned. So it can live inside `nums` itself, in the part that `read` has already passed.

That gives the invariant: **`nums[0 .. write - 1]` holds each distinct value seen so far, once, in sorted order.** Everything from `write` to `read - 1` is leftover and can be overwritten.

1. Set `write = 1`. The first element is always kept, and the constraints guarantee at least one.
2. For `read` from `1` to `n - 1`:
   1. If `nums[read] !== nums[write - 1]`, it is a new value. Copy it to `nums[write]` and increment `write`.
   2. Otherwise it repeats the last kept value, so skip it.
3. `write` is now the number of distinct values `k`. Return `nums.slice(0, write)`.

Since `write <= read` at all times, the copy only ever writes into a slot that has already been read. Nothing unread is lost.

**Why compare with `nums[write - 1]`?** In this version, `nums[read - 1]` works too, because sorted duplicates are adjacent. But comparing with the last *kept* value is what generalises: to keep at most two copies of each value, start `write` at 2 and compare with `nums[write - 2]`.

## Walkthrough

`nums = [1, 1, 2, 3, 3, 3, 5]`. Start with `write = 1`.

| read | nums[read] | last kept `nums[write - 1]` | action | write after | nums after |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1 | skip | 1 | `[1, 1, 2, 3, 3, 3, 5]` |
| 2 | 2 | 1 | copy to index 1 | 2 | `[1, 2, 2, 3, 3, 3, 5]` |
| 3 | 3 | 2 | copy to index 2 | 3 | `[1, 2, 3, 3, 3, 3, 5]` |
| 4 | 3 | 3 | skip | 3 | unchanged |
| 5 | 3 | 3 | skip | 3 | unchanged |
| 6 | 5 | 3 | copy to index 3 | 4 | `[1, 2, 3, 5, 3, 3, 5]` |

`write = 4`, so the answer is `[1, 2, 3, 5]`. The `3, 3, 5` after index 3 is leftover and doesn't matter.

## Complexity

- Brute force with a second array: time `O(n)`, one pass to collect and one to copy back. Space `O(n)` for the second array.
- Delete-as-you-go with shifting: time `O(n²)` in the worst case, space `O(1)`.
- Read and write pointers: time `O(n)`, a single pass with constant work per element. Space `O(1)` for the compaction. The returned slice is just the output format.

## Edge cases

- One element: the loop doesn't run and the answer is that element.
- All values equal, like `[-4, -4, -4]`: `write` stays at 1.
- Already distinct, like `[0, 2, 9]`: every element is copied onto itself and `write` ends at `n`.
- Negative values and zero: compared like any other number.
- Long runs of one value at the start or end: handled identically, no special case.

## Common mistakes

- Starting `write` at 0 and comparing with `nums[write - 1]`, which reads index `-1` on the first step.
- Calling `splice` inside the loop to delete duplicates. Each call shifts the tail, giving `O(n²)`, and changing the length while indexing over it skips elements.
- Returning `write - 1` or `write + 1`. After the loop, `write` already counts the kept values.
- Using a `Set` and calling it in place. It isn't, and the interviewer will ask.

## In the interview

- Confirm the input really is sorted. If it isn't, adjacency fails and you need a hash set.
- State the invariant out loud: "everything before `write` is the answer so far". It makes the code obviously correct and the follow-ups easy.
- Likely follow-ups:
  - *Keep at most two copies of each value?* Start `write` at 2 and compare with `nums[write - 2]`.
  - *Keep at most `k` copies?* Same, with `k` in place of 2.
  - *The input is unsorted?* Track seen values in a hash set and keep the first occurrence: `O(n)` time and space.
  - *Remove every value that appears more than once, not just the extras?* Look at whole runs: copy a value only when its run has length 1.
