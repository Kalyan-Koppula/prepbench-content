**Key idea:** the empty slots are at the end of `nums1`, so fill it from the back. Compare the two largest unplaced values, write the bigger one into the last free slot, and step that pointer left. The write position always stays at or ahead of the `nums1` values you still need to read.

## Recognising the pattern

Two inputs are already sorted, and you need one sorted output. That is the merge step of merge sort, and it is the "one pointer per input" variant on the [Two Pointers](/problems/patterns/two-pointers) sheet: each pointer only ever moves one way, so the merge is linear.

The twist is the in-place rule. The usual merge walks forward from the smallest values, but the front of `nums1` is full of real data. Writing there would destroy values before you have read them. The free space is at the back, so the merge has to run backwards.

## Brute force

Treat it as insertion into a sorted list. For each value of `nums2`, start at the end of the current sorted prefix of `nums1`, shift every larger value one slot right, and drop the new value into the gap. After inserting `j` values, the prefix of length `m + j` is sorted, so the final array is sorted.

This needs no extra array, but each insertion can shift up to `m + n` values. Time `O(n · (m + n))`, space `O(1)`. Another common first answer is "copy `nums2` into the tail and sort", which is `O((m + n) log(m + n))` and ignores that both inputs are already sorted.

## Optimal: merge from the back

Both brute forces waste the sortedness. The largest value of the whole result has to be either the last real value of `nums1` or the last value of `nums2`. One comparison finds it, and it belongs in the very last slot. Then the same is true of what is left.

Three indices:

- `i`: the last unplaced value in `nums1`, starting at `m - 1`.
- `j`: the last unplaced value in `nums2`, starting at `n - 1`.
- `write`: the slot to fill next, starting at `m + n - 1`.

The algorithm:

1. While `j >= 0`:
   1. If `i >= 0` and `nums1[i] > nums2[j]`, copy `nums1[i]` to `nums1[write]` and move `i` left.
   2. Otherwise copy `nums2[j]` to `nums1[write]` and move `j` left.
   3. Move `write` left.
2. Stop. Any values left at `nums1[0 .. i]` are already the smallest ones and already in their final place.

**Why nothing gets overwritten.** The number of slots still to fill is `write + 1`, and the number of values still to place is `(i + 1) + (j + 1)`. Those are equal, so `write = i + j + 1`. While `nums2` still has a value (`j >= 0`), that gives `write > i`. The slot being written is never one you still need to read.

**Why the loop stops on `j`, not on both.** If `nums2` runs out first, the remaining `nums1` prefix is sorted and sits exactly where it should. If `nums1` runs out first, the `i >= 0` check fails and the rest of `nums2` is copied over. So only `nums2` has leftovers that need work.

## Walkthrough

`nums1 = [1, 4, 7, 0, 0, 0]`, `m = 3`, `nums2 = [2, 4, 9]`, `n = 3`.

| write | nums1[i] | nums2[j] | take | nums1 after |
| --- | --- | --- | --- | --- |
| 5 | 7 | 9 | 9 from `nums2` | `[1, 4, 7, 0, 0, 9]` |
| 4 | 7 | 4 | 7 from `nums1` | `[1, 4, 7, 0, 7, 9]` |
| 3 | 4 | 4 | 4 from `nums2` (tie) | `[1, 4, 7, 4, 7, 9]` |
| 2 | 4 | 2 | 4 from `nums1` | `[1, 4, 4, 4, 7, 9]` |
| 1 | 1 | 2 | 2 from `nums2` | `[1, 2, 4, 4, 7, 9]` |

Now `j = -1`, so the loop ends. The `1` at index 0 never moved, and it didn't need to. Notice the row with `write = 2`: it overwrites the old `7` at index 2, but that `7` was already copied to index 4 two steps earlier, and `i` has moved past it. A slot in the real part of `nums1` only gets written after its value has been placed.

## Complexity

- Insertion brute force: time `O(n · (m + n))`, since each of the `n` insertions may shift the whole prefix. Space `O(1)`.
- Copy and sort: time `O((m + n) log(m + n))`, space depends on the sort.
- Merge from the back: time `O(m + n)`, since every step places one value for good. Space `O(1)`, three indices.

## Edge cases

- `m = 0`: `nums1` is all placeholders. `i` starts at `-1`, so every value comes from `nums2`.
- `n = 0`: the loop never runs and `nums1` is unchanged.
- Every value in `nums2` is smaller than every value in `nums1`: all of `nums1` slides to the back, then `nums2` fills the front.
- Every value in `nums2` is larger: `nums2` fills the tail and `nums1` is untouched.
- Equal values and negatives: the comparison `>` handles them. On a tie either choice gives the same array.

## Common mistakes

- Merging from the front into `nums1`, which overwrites values before they are read.
- Looping `while (i >= 0 && j >= 0)` and forgetting to copy the leftover `nums2` values afterwards.
- Dropping the `i >= 0` check. In Java or C++ that reads out of bounds. In JavaScript `nums1[-1]` is `undefined`, which happens to compare as false, so the bug hides until the code is ported.
- Treating the placeholder zeros as real data, for example by merging all `m + n` entries of `nums1`.

## In the interview

- Start by confirming the contract: `nums1` has exactly `n` spare slots at the end, and the function modifies `nums1` and returns nothing.
- Say the forward merge first, then point out that it would overwrite live data, and that the spare room is at the back. "So I merge from the back, largest first" is the whole solution.
- Likely follow-ups:
  - *Prove the write never clobbers unread data?* `write = i + j + 1`, so `write > i` while `j >= 0`.
  - *Merge `k` sorted arrays?* Use a min-heap of the current heads, `O(N log k)`, or merge them in pairs.
  - *The extra space is at the front instead?* Merge forward, smallest first, by the mirror argument.
  - *Return the result without mutating either input?* Allocate a new array and do the ordinary forward merge.
