**Key idea:** keep three regions while you scan: 0s at the front, 2s at the back, 1s in the middle, and an unexamined zone between them. Look at the first unexamined value and swap it into the right region. One pass, constant memory. This is the Dutch national flag partition.

## Recognising the pattern

Only three distinct values, sorted in place, in one pass: that combination points to **partitioning** with pointers rather than sorting. With so few values you can also count them, which is a hashing-style idea from the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. The single-pass follow-up asks for the three-pointer partition.

## Brute force: counting sort

Count the 0s, 1s and 2s in one pass, then overwrite the array: that many 0s, then 1s, then 2s. That is the reference brute force below.

It is correct and already linear: time `O(n)`, space `O(1)` (three counters). It just needs **two** passes and rewrites every element. (Any comparison sort also works in `O(n log n)`, but the statement forbids the library sort.)

## Optimal: one pass with three pointers

Keep these regions at all times:

```
[0, low)      all 0s
[low, mid)    all 1s
[mid, high]   not examined yet
(high, n-1]   all 2s
```

Start with `low = 0`, `mid = 0`, `high = n - 1`, so everything is unexamined. While `mid <= high`, look at `nums[mid]`:

1. **It is 0.** Swap it with `nums[low]`. The value arriving at `mid` came from the 1s region (or is the same cell), so it is already examined. Advance both `low` and `mid`.
2. **It is 1.** It is already in the right place. Advance `mid`.
3. **It is 2.** Swap it with `nums[high]` and shrink the 2s boundary with `high--`. Do **not** advance `mid`: the value that just arrived came from the unexamined zone and still needs a look.

The loop ends when the unexamined zone is empty. Each step either advances `mid` or shrinks `high`, so there are at most `n` steps.

## Walkthrough

`nums = [2, 0, 2, 1, 1, 0]`

| step | low | mid | high | nums[mid] | action | array after |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0 | 5 | 2 | swap mid↔high, high− | [0,0,2,1,1,2] |
| 2 | 0 | 0 | 4 | 0 | swap low↔mid, low+, mid+ | [0,0,2,1,1,2] |
| 3 | 1 | 1 | 4 | 0 | swap low↔mid, low+, mid+ | [0,0,2,1,1,2] |
| 4 | 2 | 2 | 4 | 2 | swap mid↔high, high− | [0,0,1,1,2,2] |
| 5 | 2 | 2 | 3 | 1 | mid+ | same |
| 6 | 2 | 3 | 3 | 1 | mid+ | same |

`mid` is now 4, past `high = 3`, so the loop stops with `[0, 0, 1, 1, 2, 2]`.

## Complexity

- Counting sort: time `O(n)` in two passes, space `O(1)`.
- Three pointers: time `O(n)` in one pass, at most one swap per step. Space `O(1)`.

## Edge cases

- A single element: the loop runs once and leaves it alone.
- All one color: only one branch ever runs.
- Already sorted or reverse sorted: both work. Reverse order exercises the "2 at mid" branch the most.
- No 1s at all: the middle region simply stays empty.

## Common mistakes

- Advancing `mid` after swapping with `high`. The value that arrives from `high` hasn't been examined, so a 0 or 2 can be skipped.
- Looping while `mid < high` instead of `mid <= high`, which leaves the last unexamined cell unchecked.
- Not advancing `mid` after swapping with `low`, which can loop forever on certain inputs.

## In the interview

- Mention counting sort first: it is linear and simple. Then: "In one pass, I'll keep four regions with three pointers."
- Write the region invariants down before coding. Most bugs come from forgetting which pointer the swapped-in value came from.
- Likely follow-ups:
  - *Four or more colors?* Counting sort generalises directly. The pointer version gets awkward; for `k` colors, counting is the better answer.
  - *Stable order of equal elements (sorting objects by color)?* The swap version isn't stable. Use counting with an output array, or a stable partition.
  - *Partition around a pivot value?* It is exactly this algorithm with "less than", "equal" and "greater than" in place of 0, 1 and 2, as in three-way quicksort.
