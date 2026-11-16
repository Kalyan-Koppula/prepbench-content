**Key insight:** the rightmost position that can still grow is the first `i` (from the right) with `nums[i] < nums[i + 1]`. Bump it by the smallest possible amount, then reset everything after it to its smallest arrangement.

## Approach

1. Find the pivot: the largest `i` with `nums[i] < nums[i + 1]`. Everything after `i` is non-increasing.
2. If there's no pivot, the array is the last permutation — reverse the whole array and stop.
3. From the right, find the first `j` with `nums[j] > nums[i]` — the smallest value in the suffix that is still larger than the pivot (rightmost among equals). Swap `nums[i]` and `nums[j]`.
4. The suffix is still non-increasing after the swap; reverse it to make it ascending.

Walk through `[2, 4, 3, 1]`: pivot is `2` (index 0), the smallest larger suffix value is `3`, swap → `[3, 4, 2, 1]`, reverse the suffix → `[3, 1, 2, 4]`.

## Complexity

- Time `O(n)` — at most three linear scans.
- Space `O(1)`.

## Alternatives to mention

- Generate all permutations, sort, and find the next one: `O(n! · n)` — only worth mentioning to dismiss.

## Pitfalls

- Use `>=` when scanning for the pivot (`nums[i] >= nums[i + 1]` keeps moving left) and `<=` when scanning for `j`, so duplicates like `[1, 5, 5]` are handled.
- Sorting the suffix instead of reversing works but costs `O(n log n)`.
