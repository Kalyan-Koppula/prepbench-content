**Key idea:** start with the smallest and the largest value. If their sum is too small, the smallest value can't be in any pair, so move the left pointer up; if it is too large, move the right pointer down. Each step discards one value, so one pass finds the pair with no extra memory.

## Recognising the pattern

The array is **sorted** and you need a **pair** with a target sum. Sorted input plus a pair condition is the signature of the opposite-ends variant in the [Two Pointers](/problems/patterns/two-pointers) sheet. Compared with the unsorted Two Sum, the order replaces the hash map, which is why the constant-space requirement is achievable.

## Brute force

Check every pair `(i, j)` with `i < j`. Return the first one that sums to `target`, converted to 1-based indices. That is the reference brute force below.

Correct because it tries every pair. Time `O(n²)`, space `O(1)`.

## Better: binary search for the partner

For each `i`, binary search the rest of the array for `target - numbers[i]`. Time `O(n log n)`, space `O(1)`. It uses the order, but only half as well as it could.

## Optimal: two pointers from both ends

1. `left = 0`, `right = n - 1`.
2. While `left < right`:
   1. `sum = numbers[left] + numbers[right]`.
   2. If `sum == target`, return `[left + 1, right + 1]`.
   3. If `sum < target`, `left++`.
   4. Otherwise `right--`.

**Why it never skips the answer.** Suppose `sum < target`. `numbers[right]` is the largest value still available, so `numbers[left]` paired with **anything** remaining is at most this sum, which is too small. `numbers[left]` can't be part of the answer, and dropping it is safe. The case `sum > target` is the mirror image: `numbers[right]` is too big even with the smallest remaining partner. Each step removes one element that provably isn't in the answer, so the answer is never passed over.

## Walkthrough

`numbers = [1, 3, 4, 6, 9]`, `target = 10`

| left (value) | right (value) | sum | action |
| --- | --- | --- | --- |
| 0 (1) | 4 (9) | 10 | found → return `[1, 5]` |

A case that needs moves, `target = 7`:

| left (value) | right (value) | sum | action |
| --- | --- | --- | --- |
| 0 (1) | 4 (9) | 10 | too big → right− |
| 0 (1) | 3 (6) | 7 | found → `[1, 4]` |

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Binary search per element: time `O(n log n)`, space `O(1)`.
- Two pointers: time `O(n)`, each step moves one pointer inward. Space `O(1)`.

## Edge cases

- The pair is the first two or last two elements: the pointers simply walk until they meet it.
- Duplicate values, like `[2, 2, 3]` with target 4: the pointers stop at two different positions holding equal values.
- Negative numbers: the order argument doesn't depend on sign.
- Exactly two elements: they must be the answer.

## Common mistakes

- Returning 0-based indices when the problem asks for 1-based ones.
- Using `left <= right`, which can pair an element with itself.
- Reaching for a hash map, which works but ignores the constant-space requirement.

## In the interview

- Point out that the input is sorted and that you'll use that instead of a hash map.
- Explain why moving a pointer can't skip the answer. That argument is what the interviewer is checking.
- Likely follow-ups:
  - *Unsorted input?* Use a hash map of value to index (Two Sum), or sort with indices attached.
  - *All pairs, without duplicates?* After a match, move both pointers and skip equal values.
  - *Three numbers summing to a target?* Fix one, then run this two-pointer search on the rest (3Sum).
