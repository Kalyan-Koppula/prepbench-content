**Key idea:** walk the array once and remember every value you have passed in a hash set. The first value that is already in the set is a duplicate.

## Recognising the pattern

The question is about **membership**: "have I seen this value before?". Answering that with a scan of everything so far is quadratic. A hash set answers it in `O(1)` on average, which is the core move of the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet: trade memory for constant-time lookups.

## Brute force

Compare every pair `(i, j)` with `i < j`. If any pair holds equal values, return `true`; if the loops finish, return `false`. It is correct because a duplicate is exactly a pair of positions with equal values, and every pair is checked.

Time `O(n²)`, space `O(1)`. With `n = 10^5` that is about 5 billion comparisons, far too slow.

## Better: sort first

Sort a copy of the array. Equal values end up next to each other, so one pass comparing `nums[i]` with `nums[i - 1]` finds any duplicate. Time `O(n log n)`, and space `O(1)` to `O(n)` depending on whether you may sort in place. This is a good answer when memory is tight.

## Optimal: one pass with a hash set

The brute force rescans earlier elements for every new one. Store them instead.

1. Create an empty set `seen`.
2. For each value `x` in order:
   1. If `seen` contains `x`, return `true`.
   2. Otherwise add `x` to `seen`.
3. Return `false`.

The invariant: before processing index `i`, `seen` holds exactly the values at positions `0 .. i - 1`, and none of them repeat (otherwise we would already have returned). So if `nums[i]` is in the set, it equals some earlier element.

The early return matters in practice: on input with an early repeat, the loop stops after a few steps.

## Walkthrough

`nums = [3, 1, 4, 1, 5]`

| i | value | in `seen`? | `seen` after |
| --- | --- | --- | --- |
| 0 | 3 | no | {3} |
| 1 | 1 | no | {3, 1} |
| 2 | 4 | no | {3, 1, 4} |
| 3 | 1 | **yes** | return `true` |

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Sort and scan: time `O(n log n)`, space depends on the sort.
- Hash set: time `O(n)` on average, since each insert and lookup is `O(1)`. Space `O(n)` in the worst case, when every value is distinct.

## Edge cases

- A single element: no pair exists, so the answer is `false`.
- Negative numbers and zero: a hash set treats them like any other value.
- All values equal: the answer appears at index 1.
- All values distinct: the set grows to `n` elements and the function returns `false`.

## Common mistakes

- Comparing `nums[i]` with itself (`j` starting at `i` instead of `i + 1`) in the brute force, which always reports a duplicate.
- Building the whole set first and then comparing `set.size` with `nums.length`. It is correct, but it can't stop early and reads as a trick rather than an algorithm.
- Sorting the caller's array in place without saying so. Mention that it mutates the input.

## In the interview

- Ask whether you may modify the input and whether memory is limited. That decides between sorting and hashing.
- Say the brute force in one line, then: "A set gives constant-time membership, so one pass is enough."
- Likely follow-ups:
  - *Duplicates within distance `k`?* Keep a set of only the last `k` values: a sliding window over the array.
  - *Values within `t` of each other and within `k` positions?* Bucket values into ranges of width `t + 1` and check the neighbouring buckets.
  - *No extra memory allowed?* Sort and compare neighbours.
