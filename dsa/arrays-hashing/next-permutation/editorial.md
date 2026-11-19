**Key idea:** find the rightmost position where the array can still get bigger: the last index `i` with `nums[i] < nums[i + 1]`. Swap `nums[i]` with the smallest larger value to its right, then reverse everything after `i` so that the tail is as small as possible.

## Recognising the pattern

"The next ordering in dictionary order" is a classic array-manipulation problem from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The trick is to think about how a number like 1 2 4 3 increments: the right part that is already as large as possible (descending) can't change on its own, so the change must happen just to its left.

## Brute force

Generate every distinct ordering in lexicographic order, find the current one, and take the next. If the current one is last, wrap to ascending order. That is the reference brute force below.

It is correct by definition. Time `O(n! · n)`, which is only feasible for tiny arrays, and it needs `O(n)` space for the recursion. It is useful to state, and also shows why a direct rule is needed.

## Optimal: pivot, swap, reverse

Read the array from the right. A non-increasing suffix such as `5 3 1` is already the **largest** arrangement of its values: no rearrangement of only those positions makes the whole array bigger. So the next permutation must change the element just to the left of the longest non-increasing suffix.

1. **Find the pivot.** Walk left from `n - 2` while `nums[i] >= nums[i + 1]`. Stop at the first `i` with `nums[i] < nums[i + 1]`. If none exists, the whole array is non-increasing: it is the last ordering.
2. **Swap.** If a pivot exists, find the rightmost `j > i` with `nums[j] > nums[i]`. Because the suffix is non-increasing, scanning from the right finds the **smallest** value larger than the pivot. Swap `nums[i]` and `nums[j]`. The prefix is now as small as it can be while still being larger than before.
3. **Reverse the suffix.** After the swap, the suffix is still non-increasing. Reversing it makes it ascending, which is its smallest arrangement. If there was no pivot, this reverses the whole array, giving ascending order: the required wrap-around.

**Why the rightmost larger value?** With duplicates, choosing the rightmost copy keeps the suffix non-increasing after the swap, so step 3 can simply reverse.

## Walkthrough

`nums = [1, 3, 5, 4, 2]`

| step | what happens | array |
| --- | --- | --- |
| find pivot | 4 ≥ 2, 5 ≥ 4, 3 < 5 → pivot at index 1 (value 3) | [1, **3**, 5, 4, 2] |
| find swap | from the right: 2 ≤ 3, 4 > 3 → index 3 | [1, 3, 5, **4**, 2] |
| swap | 3 ↔ 4 | [1, 4, 5, 3, 2] |
| reverse suffix | reverse indices 2..4 | [1, 4, 2, 3, 5] |

`[1, 4, 2, 3, 5]` is the next ordering after `[1, 3, 5, 4, 2]`.

## Complexity

- Brute force: time `O(n! · n)`, space `O(n)`.
- Pivot, swap, reverse: time `O(n)`, at most three passes over the suffix. Space `O(1)`.

## Edge cases

- A single element: no pivot, and reversing one element does nothing.
- The last ordering, like `[3, 2, 1]`: no pivot, so the whole array is reversed to `[1, 2, 3]`.
- Duplicates, like `[1, 5, 1]`: the pivot is index 0, the swap target is the 5, giving `[5, 1, 1]`.
- Already ascending, like `[1, 2, 3]`: the pivot is the second-to-last element, and the result swaps the last two.

## Common mistakes

- Using `>` instead of `>=` when looking for the pivot, which breaks on duplicates.
- Swapping with the first larger value from the **left** of the suffix instead of the right, which isn't the smallest larger value.
- Sorting the suffix instead of reversing it. It works, but `O(n log n)` hides the insight that the suffix is already ordered.
- Forgetting the wrap-around case.

## In the interview

- Work an example by hand first: interviewers like to see you discover "the suffix is descending".
- State the three steps, then justify each one in a sentence.
- Likely follow-ups:
  - *Previous permutation?* Mirror every comparison: find the last `i` with `nums[i] > nums[i + 1]`, swap with the largest smaller value to its right, then reverse.
  - *The `k`-th permutation of `1..n` directly?* Use the factorial number system to pick each position (Permutation Sequence).
  - *Generate all permutations in order?* Start from sorted and call next permutation until it wraps.
