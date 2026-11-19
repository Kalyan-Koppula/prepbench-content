---
title: Two Pointers
order: 2
summary: Two indices that only move inward or forward — each step proves one element useless and drops it, turning O(n²) pair checks into one O(n) pass.
---

## The idea

A lot of array questions are secretly about **pairs of positions**: two values that add up to a target, two walls that hold the most water, the character at the front and the one at the back. Checking every pair `(i, j)` with `i < j` costs about `n²/2` comparisons. Two pointers checks a tiny fraction of those pairs and still never misses the answer.

You keep two indices and move them by a rule. In the most common layout one pointer, `left`, starts at the first element and the other, `right`, starts at the last. You look at the pair they point to, decide that **one of the two elements can't be part of any answer any more**, and step past it. Here is a sorted array searched for two values that sum to `10`:

```
index:   0   1   2   3   4   5
value:   1   3   4   6   8  11

         L                   R     1 + 11 = 12  too big    -> R steps left
         L               R         1 +  8 =  9  too small  -> L steps right
             L           R         3 +  8 = 11  too big    -> R steps left
             L       R             3 +  6 =  9  too small  -> L steps right
                 L   R             4 +  6 = 10  found
```

Five checks instead of fifteen. The pointers never move backwards, so they meet after at most `n - 1` steps.

The second layout has both pointers moving **the same way**. A fast `read` pointer visits every element, and a slow `write` pointer marks where the next element worth keeping should go. This is how you filter, compact or deduplicate an array in place, without a second array. A third layout puts one pointer on **each of two inputs**, as in merging two sorted lists.

All three share one property: every pointer moves in one direction only, and each move is justified by an argument about what you can safely ignore. That argument is the whole pattern.

## When to reach for it

Signals in the statement:

- The input is **sorted**, or sorting it doesn't break the question (you need values, not original positions), and you want a pair, triplet or quadruplet with some sum.
- The answer depends on the **two ends** of something: a palindrome check, reversing, the two walls of a container.
- "**In place**", "O(1) extra space", "remove", "move to the end", "keep the relative order": a read/write pair.
- Two sorted sequences that must be merged, intersected or compared.
- An `O(n²)` brute force where, after comparing a pair, you can tell which side "lost".

Look-alikes that need a different tool:

| Statement says | Why two pointers fails | Use instead |
| --- | --- | --- |
| Pair with a target sum, **unsorted**, return original indices | Sorting scrambles the indices, and costs `O(n log n)` anyway | A hash map of value to index, one pass |
| Longest or shortest **contiguous** range meeting a condition | You care about everything between the pointers, not just the two ends | [Sliding window](/problems/patterns/sliding-window) |
| Count subarrays with sum exactly `k`, negatives allowed | No rule tells you which pointer to move | Prefix sums with a hash map |
| Next greater or smaller element for each index | Each element needs its own partner, not one shared pair | A monotonic stack |
| Find a value in a sorted array | Only one position is involved | Binary search |

Sliding window is technically two pointers as well. The difference is the question: a window cares about the **range** `[left, right]` and keeps a summary of it, while classic two pointers cares about the **elements at** `left` and `right`.

## How it works

Take Two Sum II: a sorted array and a target, find the pair. The loop keeps one **invariant**:

> If an answer pair exists, both of its positions are inside `[left, right]`.

At the start this is true trivially. Now compare `sum = a[left] + a[right]` with the target:

- `sum < target`. The partner that gives `a[left]` its largest possible sum is `a[right]`, the biggest value still in range. Even that is too small, so `a[left]` pairs with **nothing** in range. Dropping it keeps the invariant. Move `left` right.
- `sum > target`. Symmetric: `a[right]` with the smallest value in range is already too big, so `a[right]` is useless. Move `right` left.
- `sum === target`. Done.

Every step removes one candidate and the range shrinks by one, so the loop runs at most `n - 1` times. That is the speed-up: one comparison rules out a whole **row or column** of pairs at once. Lay the pairs out as a grid, rows for the left value and columns for the right value, and mark each cell with the step that eliminated it:

```
              right value:   3    4    6    8   11
  left value  1              2    2    2    2    1
              3                   4    4    3    1
              4                        *    3    1
              6                             3    1
              8                                  1
```

Step 1 wipes out the whole `11` column, step 2 the whole `1` row, and so on, until step 5 lands on `*`. Fifteen pairs, five checks. The same trace as a table:

| step | left | right | a[left] + a[right] | verdict | move |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 5 | 1 + 11 = 12 | too big, 11 can't pair with anything | right-- |
| 2 | 0 | 4 | 1 + 8 = 9 | too small, 1 can't pair with anything | left++ |
| 3 | 1 | 4 | 3 + 8 = 11 | too big | right-- |
| 4 | 1 | 3 | 3 + 6 = 9 | too small | left++ |
| 5 | 2 | 3 | 4 + 6 = 10 | match | return `[3, 4]` (1-based) |

Notice that sortedness is what makes the elimination safe. Without it, "the biggest value still in range" isn't `a[right]`, and the argument falls apart.

The read/write layout has a different invariant: **`a[0..write-1]` holds exactly the elements kept so far, in their original order**. `read` is always at or ahead of `write`, so writing to `a[write]` only ever overwrites an element that has already been read or copied. That is why no second array is needed.

## Templates

### Opposite ends (converging)

```ts
function pairWithSum(a: number[], target: number): number[] {
  let left = 0
  let right = a.length - 1
  while (left < right) {
    const sum = a[left] + a[right]
    if (sum === target) {
      return [left, right]
    }
    if (sum < target) {
      left++ // a[left] is too small even with the largest partner left
    } else {
      right-- // a[right] is too big even with the smallest partner left
    }
  }
  return [-1, -1]
}
```

- `left < right`, not `left <= right`: a pair needs two different positions. Use `<=` only when a single middle element is meaningful on its own.
- Every branch must move a pointer. If you return on a match that's fine; if you collect all matches, move **both** pointers after recording one, or the loop never ends.
- The comment on each move is the proof. If you can't write it, the move is probably wrong.

### Same direction (read and write)

```ts
function keepMatching(a: number[]): number {
  let write = 0
  for (let read = 0; read < a.length; read++) {
    if (shouldKeep(a, read, write)) {
      a[write] = a[read]
      write++
    }
  }
  // a[0..write-1] now holds the kept elements in their original order
  return write
}
```

- `shouldKeep` is the only part that changes. For "remove duplicates from a sorted array" it is `write === 0 || a[read] !== a[write - 1]`: compare with the last **kept** value, not with `a[read - 1]`.
- Return `write` as the new length. Positions from `write` onwards hold leftovers; fill them only if the problem asks (Move Zeroes wants zeros there).
- If order doesn't matter and removals are rare, a swap with the last element is fewer writes. If order matters, stick to this template.

### One pointer per input

```ts
function mergeSorted(first: number[], second: number[]): number[] {
  const result: number[] = []
  let i = 0
  let j = 0
  while (i < first.length && j < second.length) {
    if (first[i] <= second[j]) {
      result.push(first[i])
      i++
    } else {
      result.push(second[j])
      j++
    }
  }
  while (i < first.length) {
    result.push(first[i])
    i++
  }
  while (j < second.length) {
    result.push(second[j])
    j++
  }
  return result
}
```

- The main loop stops when **either** input runs out. The two drain loops afterwards are easy to forget.
- `<=` instead of `<` keeps the merge stable: equal values from `first` come out before those from `second`.
- To merge **into** an array that has spare room at its end, run the same idea backwards: start both pointers at the last real element, write from the last slot, and take the larger value each time.

### Fix one, then converge

```ts
function tripletsWithSum(a: number[], target: number): number[][] {
  a.sort((first, second) => first - second)
  const result: number[][] = []
  for (let i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) {
      continue // same first value would give the same triplets again
    }
    let left = i + 1
    let right = a.length - 1
    while (left < right) {
      const sum = a[i] + a[left] + a[right]
      if (sum < target) {
        left++
      } else if (sum > target) {
        right--
      } else {
        result.push([a[i], a[left], a[right]])
        left++
        right--
        while (left < right && a[left] === a[left - 1]) {
          left++
        }
      }
    }
  }
  return result
}
```

- Sort with a comparator. The default `sort()` compares as strings, so `10` lands before `9`.
- Skip duplicates **after** using a value: `a[i] === a[i - 1]` with `i > 0`, and the inner skip only after a match. Skipping before use throws away valid triplets like `[-1, -1, 2]`.
- Each extra element in the tuple adds one outer loop. 4Sum is two nested loops around the same converging core.

### Choosing a template

- A pair (or the last two members of a tuple) in sorted data, or a symmetry check: **opposite ends**.
- Filter, compact, dedupe or partition one array in place: **read and write**.
- Two sorted inputs: **one pointer per input**, backwards if the output overlaps an input.
- Triplets or quadruplets: **fix one (or two), then converge**.

## Choosing the pointer layout

The decision is really "what does each pointer stand for, and what lets me move it?":

| Layout | Pointers start at | Move rule | Extra space | Typical cost |
| --- | --- | --- | --- | --- |
| Opposite ends | `0` and `n - 1` | Move the side that is proven useless | `O(1)` | `O(n)`, plus `O(n log n)` if you sort |
| Read and write | both at `0` | `read` every step, `write` only when keeping | `O(1)` | `O(n)` |
| One per input | the start (or end) of each input | Advance the one whose value was consumed | `O(1)` in place, else output size | `O(m + n)` |
| Fix one, then converge | outer index `i`, then `i + 1` and `n - 1` | Outer loop steps; inner pair as opposite ends | `O(1)` besides sorting | `O(n²)` for triplets, `O(n³)` for quadruplets |
| Opposite ends with running state | `0` and `n - 1`, plus `leftMax`, `rightMax` | Move the side whose state already decides its answer | `O(1)` | `O(n)` |

If you can't name the move rule, the layout is wrong. When neither side can be proven useless after a comparison, the problem probably needs a hash map, a stack or dynamic programming instead.

## Worked problems

**Valid Palindrome.** Opposite ends on the raw string, no cleaned copy. At each step, advance `left` past anything that isn't a letter or digit, and pull `right` back the same way, each skip loop guarded by `left < right`. Then compare the two characters in lowercase; any mismatch means `false`. The twist is only discipline: the skip loops need their own bound check, or an input of all punctuation runs off the end.

**3Sum.** Sort, fix `a[i]`, and run Two Sum II on the part to its right with target `-a[i]`. Two observations do the real work. Once `a[i] > 0`, every value to its right is positive too, so you can stop. And distinct triplets come from skipping repeated values at both levels, which avoids building a set of stringified triplets. Total `O(n²)`, which beats the `O(n³)` brute force by a full factor of `n`.

**Container With Most Water.** Opposite ends again, but there is no target; you maximise `(right - left) * min(height[left], height[right])`. Start at the widest pair and always move the **shorter** wall inward. Why it is safe: the shorter wall, paired with any line further in, has a smaller width and a height still capped by itself, so it can never beat the area you just recorded. That wall is finished, which is exactly the elimination argument from Two Sum II with a different reason behind it.

**Trapping Rain Water.** Water above bar `i` is `min(maxLeft(i), maxRight(i)) - height[i]`. The two-array solution precomputes both maxima. The pointer version keeps `leftMax` and `rightMax` as running values, folds the current bar on each side into them, and moves whichever side has the smaller one. If `leftMax <= rightMax`, the true maximum to the right of `left` is at least `rightMax`, so the water level at `left` is fixed by `leftMax` alone: add `leftMax - height[left]` and step in. The twist is that the pointer you move is chosen by what it **already knows**, not by a target.

## Variations and tricks

- **Skip duplicates after use.** Process a value, then advance past its copies. Guard the skip with `left < right` and compare with the neighbour you just left.
- **Fill from the back.** When merging into an array whose spare room is at the end, write from the last slot. The write position is always at or beyond both read positions, so nothing unread is overwritten.
- **Counting pairs in one pass.** To count pairs with `a[i] + a[j] < target` in a sorted array: if `a[left] + a[right] < target`, then `left` pairs with every index in `(left, right]`, so add `right - left` and move `left`. Otherwise move `right`.
- **Swap instead of copy.** In Move Zeroes, swapping `a[read]` with `a[write]` pushes zeros backwards as you go, so no clean-up loop is needed afterwards. Copying the non-zeros forward and zero-filling the tail also works; either way, skip the write when `read === write` to cut writes when zeros are rare.
- **k-sum reduction.** Sort once, add one outer loop per extra element, and finish with a converging pair. Prune an outer value early when even the smallest possible sum with it is already above the target.
- **Sort with indices.** If you must sort but also report original positions, sort an array of indices by value. Often a hash map is simpler.
- **Pointers at different speeds.** On a linked list, a pointer that moves two steps per turn and one that moves one step find the middle node, or detect a cycle, with `O(1)` space. Same family, different data structure.

## Complexity

- Opposite ends, read and write, and one pointer per input: `O(n)` (or `O(m + n)`), because each pointer moves in one direction and can make at most `n` moves. `O(1)` extra space.
- If the input must be sorted first, the sort dominates: `O(n log n)` time, and the sort itself may use `O(log n)` to `O(n)` space depending on the engine.
- Fix one, then converge: `O(n²)` for triplets, `O(n³)` for quadruplets. Each fixed prefix costs one `O(n)` pass. The output list is not counted as extra space.

## Pitfalls

- `left <= right` where a pair needs two positions, so an element gets paired with itself.
- Collecting all matches but moving only one pointer, or none, after a hit: an infinite loop.
- Duplicate-skip loops without `left < right`, which read past the end of the range.
- Skipping duplicates **before** using a value, which loses answers that repeat a value inside one tuple.
- Sorting with the default comparator, so `[10, 9, 1]` becomes `[1, 10, 9]`.
- Sorting when the question wants original indices.
- In read/write, comparing with `a[read - 1]` after the array has been overwritten; compare with `a[write - 1]`, the last kept value.
- Merging from the front into the array that holds the input, overwriting values not yet read.
- Large sums overflowing 32-bit integers in Java or C++ (4Sum values reach `10^9`). JavaScript numbers are exact up to `2^53`, but say it out loud in an interview.

## Practice ladder

1. [Valid Palindrome](/problems/valid-palindrome): opposite ends on a string, with skip loops that respect the bounds.
2. [Two Sum II – Input Array Is Sorted](/problems/two-sum-ii-input-array-is-sorted): the elimination argument in its purest form.
3. [3Sum](/problems/3sum): fix one element, converge on the rest, and skip duplicates at both levels.
4. [4Sum](/problems/4sum): one more outer loop, plus pruning and large-sum care.
5. [Container With Most Water](/problems/container-with-most-water): converging without a target, moving the side that can no longer win.
6. [Merge Sorted Array](/problems/merge-sorted-array): one pointer per input, filled from the back so nothing is overwritten.
7. [Remove Duplicates from Sorted Array](/problems/remove-duplicates-from-sorted-array): the read/write template comparing against the last kept value.
8. [Move Zeroes](/problems/move-zeroes): read/write with swaps, keeping order and minimising writes.
9. [Trapping Rain Water](/problems/trapping-rain-water): converging pointers carrying running maxima, moving the side whose answer is already decided.
