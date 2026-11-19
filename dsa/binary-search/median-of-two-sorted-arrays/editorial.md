**Key idea:** the median splits the combined values into a left half and a right half. Choose how many elements of the **shorter** array go into the left half; the number from the other array then follows. The split is correct when every left value is `<=` every right value, which you can test by comparing just the four values around the two cuts. Binary search that count.

## Recognising the pattern

`O(log(m + n))` with two sorted arrays rules out merging. The [Binary Search](/problems/patterns/binary-search) sheet's approach of searching a **position** with a test that says "too far left" or "too far right" applies: you search where to cut the shorter array.

## Brute force

Concatenate the arrays, sort, and read the middle: `O((m + n) log(m + n))`. A better baseline merges them like merge sort, since both are already sorted, and reads the middle: `O(m + n)` time and space. That merge is the reference brute force below.

## Optimal: binary search on the partition

Let `half = floor((m + n + 1) / 2)`, the size of the left half (it holds the extra element when the total is odd). Choose `i` elements from `nums1` for the left half, so `j = half − i` come from `nums2`.

Around the cuts:

- `left1 = nums1[i − 1]`, `right1 = nums1[i]`
- `left2 = nums2[j − 1]`, `right2 = nums2[j]`

with −∞ or +∞ when an index is out of range. Each array is sorted, so `left1 <= right1` and `left2 <= right2` already hold. The split is correct exactly when the cross conditions hold too: `left1 <= right2` and `left2 <= right1`.

1. Make `nums1` the shorter array.
2. `lo = 0`, `hi = m`. While `lo <= hi`:
   1. `i = lo + floor((hi − lo) / 2)`, `j = half − i`.
   2. If `left1 > right2`, too many came from `nums1`: `hi = i − 1`.
   3. Else if `left2 > right1`, too few came from `nums1`: `lo = i + 1`.
   4. Else the split is correct. If `m + n` is odd, the median is `max(left1, left2)`. Otherwise it is the average of `max(left1, left2)` and `min(right1, right2)`.

**Why search the shorter array?** Then `j = half − i` is never negative or larger than `n` for any `i` in `[0, m]`. It also makes the time `O(log(min(m, n)))`.

## Walkthrough

`nums1 = [1, 3, 8]`, `nums2 = [7, 9, 10, 11]`. `m = 3`, `n = 4`, total 7, `half = 4`.

| lo | hi | i | j | left1, right1 | left2, right2 | test | next |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 3 | 1 | 3 | 1, 3 | 10, 11 | left2 > right1 | lo = 2 |
| 2 | 3 | 2 | 2 | 3, 8 | 9, 10 | left2 > right1 | lo = 3 |
| 3 | 3 | 3 | 1 | 8, +∞ | 7, 9 | ok | median |

Odd total, so the median is `max(8, 7) = 8`. Check: combined `[1, 3, 7, 8, 9, 10, 11]`, middle value 8.

## Complexity

- Sort: time `O((m + n) log(m + n))`, space `O(m + n)`.
- Merge: time `O(m + n)`, space `O(m + n)` (or `O(1)` if you only walk to the middle).
- Partition search: time `O(log(min(m, n)))`, space `O(1)`.

## Edge cases

- One array empty: with `nums1` empty, `i = 0` and the median comes from `nums2` alone.
- All of `nums1` smaller than `nums2`: the search ends at `i = m`.
- Even total: average the two middle values, so the result may be fractional.
- Duplicates across arrays: the `<=` conditions handle ties.

## Common mistakes

- Searching the longer array, so `j` goes out of range.
- Forgetting the infinities at the edges.
- Mixing up which bound to move: `left1 > right2` means `i` is too big.
- Computing `half` without the `+ 1`, which puts the extra element on the right and changes the odd case.

## In the interview

- Start with the merge solution and its `O(m + n)` cost, then: "I need logarithmic time, so I'll binary search the partition of the shorter array."
- Explain the four boundary values and the two cross conditions with a drawing.
- Likely follow-ups:
  - *`k`-th smallest of two sorted arrays?* The same partition with `half = k`, or eliminate `k / 2` elements per step.
  - *Median of a stream?* Two heaps (Find Median from Data Stream).
