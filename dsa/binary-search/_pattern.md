---
title: Binary Search
order: 5
summary: Find where a yes/no question flips from no to yes, halving the candidates each step — in a sorted array, a rotated one, or a range of possible answers.
---

## The idea

Binary search is less about sorted arrays than about a question you can ask of each candidate that answers **no, no, ..., yes, yes**: once it says yes, it keeps saying yes. When the answers line up like that, one look at the middle candidate tells you which half holds the flip point, and the other half can be thrown away unread.

```
candidate:   0     1     2     3     4     5     6     7
ok(i)?       no    no    no    no    yes   yes   yes   yes
             └──────── discard ────────┘  ▲
                                          first yes = the answer
```

For "find `target` in a sorted array" the question is `nums[i] >= target`. For "smallest speed that finishes in time" it is "does speed `i` finish in time?". For "minimum of a rotated array" it is "is `nums[i]` at most the last element?". The loop barely changes; the question does.

Each step halves the candidates, so `n` of them need about `log₂ n` steps: 20 looks for a million elements, 30 checks for answers up to `10^9`. The skill lies in three choices: the question, the range it is asked over, and moving `lo` and `hi` so the answer never leaves that range.

## When to reach for it

- The input is **sorted**, or sorted in pieces (rotated, sorted rows, a per-key history), and the target time is `O(log n)`.
- "First position where ...", "last value at or before ...", "insert position". These are boundaries in a monotone sequence.
- "Smallest capacity / speed such that ..." or "largest gap such that ...": the answer is a number in a known range and one candidate is easy to check. This is **binary search on the answer**.
- "Minimise the maximum" or "maximise the minimum": almost always the answer-space version with a greedy check.

Look-alikes that need something else:

| Statement says | Why binary search fails | Use instead |
| --- | --- | --- |
| Pair with a given sum in a sorted array | Searching each partner is `O(n log n)`; the pair structure allows `O(n)` | Two pointers from both ends |
| Longest contiguous subarray with a condition | The condition is about a range, not a single position | [Sliding Window](/problems/patterns/sliding-window) |
| Unsorted array, one lookup | Sorting costs more than a single scan | Linear scan or a `Set` |
| "Minimise the maximum" but feasibility is not monotone | Discarding half can discard the answer | Dynamic programming |

Before halving anything, say the monotone fact out loud: "if capacity `c` works, every larger capacity works too".

## How it works

Keep `lo`, `hi` and one **invariant**: the answer lies in `[lo, hi]`. Each step picks `mid`, asks the question, and moves one end so the answer stays inside. When one candidate is left, it is the answer.

Find the first index whose value is at least 7 in `[1, 3, 3, 5, 7, 7, 9, 11]`. The answer is one of `0..7`, or `8` meaning "every value is smaller", so start with `lo = 0`, `hi = 8`.

| step | lo | hi | mid | nums[mid] | >= 7? | move |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 8 | 4 | 7 | yes | `hi = 4`: mid may be the first yes |
| 2 | 0 | 4 | 2 | 3 | no | `lo = 3`: mid and everything left is no |
| 3 | 3 | 4 | 3 | 5 | no | `lo = 4` |
| end | 4 | 4 | – | – | – | answer 4 |

**Correct:** a yes at `mid` means the first yes is at `mid` or to its left, so `hi = mid` keeps it. A no at `mid` means everything up to `mid` is no, so the first yes is at `mid + 1` or later. Neither move loses the answer.

**Terminates:** while `lo < hi`, `Math.floor((lo + hi) / 2)` is strictly below `hi`, so both `hi = mid` and `lo = mid + 1` shrink the range, by about half each time.

## Templates

### Exact match

```ts
function search(nums: number[], target: number): number {
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (nums[mid] === target) {
      return mid
    }
    if (nums[mid] < target) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return -1
}
```

- The range is closed, so `lo <= hi`: a one-element range still needs a look.
- Both moves step **past** `mid`, because it was just ruled out. `hi = mid` here loops forever once `lo === hi`.
- Only for distinct values where any match will do. For duplicates or positions, use a boundary.

### First true (lower boundary)

```ts
function firstTrue(n: number): number {
  let lo = 0
  let hi = n // n means "nothing is true"
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (ok(mid)) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}
```

- `hi = mid`, not `mid - 1`: a yes at `mid` may be the first yes.
- It ends with `lo === hi`, so there is no "was it `lo` or `hi`?" at the end.
- Start `hi` at `n` when "none" is possible. Starting at `n - 1` quietly returns the last index instead.
- **On the answer**, this same loop runs over values: `lo` is the smallest value that could work (often the largest single item), `hi` one that surely works (often the total), and `ok` is a greedy `O(n)` feasibility pass.

### Last true (upper boundary)

```ts
function lastTrue(n: number): number {
  let lo = -1 // -1 means "nothing is true"
  let hi = n - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2) // round up
    if (ok(mid)) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  return lo
}
```

- For **yes, ..., yes, no, ..., no** when you want the last yes: "latest timestamp at or before `t`", "largest gap that still fits every cow".
- `mid` must round **up**. With two candidates left, rounding down makes `mid === lo`, the yes branch sets `lo = mid`, and nothing ever changes.
- The rule: whichever end takes `mid` with no `± 1`, round `mid` away from that end.
- Or skip this template: the last yes is one before the first no.

### Rotated sorted array

```ts
function searchRotated(nums: number[], target: number): number {
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (nums[mid] === target) {
      return mid
    }
    if (nums[lo] <= nums[mid]) {
      // [lo, mid] is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    } else {
      // [mid, hi] is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
  }
  return -1
}
```

- A rotated array is two sorted runs, so cutting at `mid` leaves at least one side without the drop. `nums[lo] <= nums[mid]` means the left side is that one.
- Keep the `<=`: when `lo === mid` the left side is one element and is sorted.
- Only trust the range check on the **sorted** side. If the target is not there, it is in the other side.

### Choosing a template

- Distinct values, "index or -1": **exact match**.
- "First", "insert position", "smallest X such that", "minimise the maximum": **first true**.
- "Last", "floor", "largest X such that", "maximise the minimum": **last true**.
- Rotated input: **rotated** to find a value; first true with `nums[i] <= nums[n - 1]` to find the minimum.

## Choosing the search space

Most bugs are wrong bounds or a question that is not quite monotone. Fix all three before coding:

| Problem shape | Candidates | Question `ok(x)` | Find |
| --- | --- | --- | --- |
| Lower bound of `target` | indices `0..n` | `nums[x] >= target` | first true |
| Latest entry `<= t` | indices `-1..n-1` | `list[x] <= t` | last true |
| Minimum of a rotated array | indices `0..n-1` | `nums[x] <= nums[n - 1]` | first true |
| Smallest speed or capacity | `max item .. total` | greedy check passes | first true |
| Largest minimum gap | `1 .. max - min` | greedy placement fits `k` | last true |

The total cost is `O(log(range))` checks times the cost of one check. Sort once outside the loop, never inside the check.

The question need not be about the value at `x`. It can compare neighbours (peaks) or ask whether a pair starting at an even index is intact (single element).

## Worked problems

**Search a 2D Matrix.** Each row continues where the previous ended, so the rows read in order form one sorted list of `m * n` values. Run exact match over flat indices and translate each `mid` into `row = Math.floor(mid / cols)`, `col = mid % cols`. Nothing is copied, and the cost is `O(log(m * n))`.

**Koko Eating Bananas.** The answer is a speed in `1..max(piles)`: at the top speed each pile takes one hour, and `h` is at least the number of piles. The check sums `Math.ceil(pile / speed)` and compares with `h`. Faster never takes longer, so first true over speeds returns the slowest one that works. The twist: at speed 1 the total can pass `2^31`, so keep bit tricks away from it.

**Search in Rotated Sorted Array.** No single question is monotone across the whole array, but every step has a sorted side. Check whether the target fits that side's range, then keep it or discard it. The twist is choosing the half from the endpoints, not from the target alone.

**Aggressive Cows.** Sort the stalls. The answer is a gap `d`; the check puts a cow in the first stall and each next cow in the first stall at least `d` past the previous one. If `k` cows fit at gap `d`, they fit at any smaller gap, so feasibility is yes, ..., no. Take the **last** yes over `1 .. stalls[n - 1] - stalls[0]` with the upward midpoint. This is Koko's mirror image.

## Variations and tricks

- **Flip the question.** The last yes is the first no minus one. One trusted template plus a flipped question avoids most rounding bugs.
- **Lower and upper bound.** First `i` with `nums[i] >= t` and first with `nums[i] > t`. Their difference counts copies of `t`.
- **Per-key history.** With increasing timestamps, append each write to a list in a `Map`; reads search for the last timestamp `<= t`.
- **Pair parity.** When every value appears twice but one, pairs start at even indices before the single value and odd ones after. Search even indices for the first `nums[i] !== nums[i + 1]`.
- **Uphill walk.** If `nums[mid] < nums[mid + 1]`, a peak lies to the right, since the climb must stop by the edge. The question is not globally monotone, but first true keeps a no on the left and a yes at `hi`, and wherever they meet is a peak.
- **Partition search.** For the median of two sorted arrays, search how many elements the shorter array puts in the left half; the other's share is forced. The cut is right when both left maxima are at most both right minima.
- **Duplicates in a rotated array.** If `nums[lo]`, `nums[mid]` and `nums[hi]` are equal, neither side is known to be sorted. Shrink by one and accept `O(n)` in the worst case.

## Complexity

- Exact and boundary searches: `O(log n)` time, `O(1)` space.
- On the answer: `O(C × log(range))`, with `C` the check cost, usually `O(n)`; about 30 checks for a range of `10^9`.
- Sorting first adds `O(n log n)` once. Recursive versions add `O(log n)` stack; loops add none.

## Pitfalls

- Mixing templates: `lo <= hi` with `hi = mid` loops forever; `lo < hi` with `hi = mid - 1` can skip the answer.
- `lo = mid` with a downward midpoint: stuck when two candidates remain.
- `hi = n - 1` when "not found" is possible.
- `(lo + hi) >> 1` on large values truncates to 32 bits. `Math.floor((lo + hi) / 2)` is exact for every safe integer.
- Answer bounds that are too low, such as a shipping capacity below the heaviest package.
- Reading `nums[mid + 1]` when `mid` can be `n - 1`. Keep `hi` at `n - 1` so `mid` stays below it.
- Range-checking the unsorted half of a rotated array.
- Assuming monotonicity. If you cannot say "if `x` works then `x + 1` works" in one sentence, look for another pattern.

## Practice ladder

1. [Binary Search](/problems/binary-search): the closed-range exact-match template in its plainest form.
2. [Search a 2D Matrix](/problems/search-a-2d-matrix): treating a grid as one sorted list through index arithmetic.
3. [Find Peak Element](/problems/find-peak-element): halving an unsorted array using one neighbour comparison.
4. [Koko Eating Bananas](/problems/koko-eating-bananas): the first search on the answer, with a ceiling-division check.
5. [Find Minimum in Rotated Sorted Array](/problems/find-minimum-in-rotated-sorted-array): first true on a rotated array, comparing against the right end.
6. [Search in Rotated Sorted Array](/problems/search-in-rotated-sorted-array): deciding which half is sorted before discarding one.
7. [Single Element in a Sorted Array](/problems/single-element-in-a-sorted-array): searching on index parity rather than values.
8. [Time Based Key-Value Store](/problems/time-based-key-value-store): a last-true search over a per-key history inside a design problem.
9. [Capacity To Ship Packages Within D Days](/problems/capacity-to-ship-packages-within-d-days): answer bounds from the heaviest item and the total.
10. [Aggressive Cows](/problems/aggressive-cows): maximise the minimum with last true and greedy placement.
11. [Split Array Largest Sum](/problems/split-array-largest-sum): minimise the maximum, counting pieces greedily.
12. [Median of Two Sorted Arrays](/problems/median-of-two-sorted-arrays): binary search on a partition point across two arrays.
