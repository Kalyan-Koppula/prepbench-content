**Key idea:** instead of looking at every subarray, ask for each element: in how many subarrays is it the minimum? If `arr[i]` can extend `L` positions to the left and `R` to the right while staying the minimum, it is the minimum of `L · R` subarrays, and contributes `arr[i] · L · R` to the sum. Monotonic stacks find `L` and `R` for every element in linear time.

## Recognising the pattern

Summing a min or max over all subarrays is quadratic if done directly. The **contribution technique** flips it: count how often each element is the answer. The counts come from "previous smaller" and "next smaller" distances, which is the monotonic stack from the [Stack](/problems/patterns/stack) sheet in both directions.

## Brute force

For each start, extend the end while keeping the running minimum, and add it to the total. That is the reference brute force below.

Correct because every subarray is visited once. Time `O(n²)`, which for `n = 3 · 10^4` is about 450 million steps. Space `O(1)`.

## Optimal: contribution with two monotonic stacks

For each index `i`:

- `left[i]` = number of choices for the start: `i − (index of the previous element smaller than arr[i])`, or `i + 1` if there is none.
- `right[i]` = number of choices for the end: `(index of the next element smaller than **or equal to** arr[i]) − i`, or `n − i` if there is none.

Then `arr[i]` is the minimum of exactly `left[i] · right[i]` subarrays.

**Ties.** If equal values appear, a subarray containing several of them would be counted for each one. Using "strictly smaller" on the left and "smaller or equal" on the right assigns each such subarray to exactly one copy (the rightmost of the equal minimums within it).

Steps:

1. Left-to-right pass with a stack of indices: pop while the top is `>= arr[i]`; the remaining top is the previous strictly smaller element.
2. Right-to-left pass: pop while the top is `> arr[i]`; the remaining top is the next smaller-or-equal element.
3. Sum `arr[i] · left[i] · right[i]` modulo `10^9 + 7`.

## Walkthrough

`arr = [3, 1, 2, 4]`

| i | value | previous smaller | left | next smaller-or-equal | right | contribution |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 3 | none | 1 | index 1 | 1 | 3 · 1 · 1 = 3 |
| 1 | 1 | none | 2 | none | 3 | 1 · 2 · 3 = 6 |
| 2 | 2 | index 1 | 1 | none | 2 | 2 · 1 · 2 = 4 |
| 3 | 4 | index 2 | 1 | none | 1 | 4 · 1 · 1 = 4 |

Total `17`, matching the ten subarrays' minimums: 3, 1, 2, 4, 1, 1, 2, 1, 1, 1.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Contribution with stacks: time `O(n)`, two passes where each index is pushed and popped once. Space `O(n)` for the arrays and stack.

## Edge cases

- All values equal: the tie rule gives each value `left = i + 1` and `right = 1`, which counts each subarray once.
- Strictly increasing values: each element's left extent is 1.
- A single element: the answer is that element.
- Large totals: take the modulo as you go. Each product fits in a double here, but needs 64 bits in Java or C++.

## Common mistakes

- Using strict comparisons on both sides, so subarrays with repeated minimums are counted more than once.
- Off-by-one in `left` and `right`: they count positions, so the "none" case is `i + 1` and `n − i`.
- Applying the modulo only at the end, after the sum may have lost precision.

## In the interview

- Explain the contribution idea first; it is the key insight.
- Call out the tie-breaking rule. Interviewers often probe it with `[2, 2]`.
- Likely follow-ups:
  - *Sum of subarray ranges (max − min)?* Compute the max contribution the same way, with reversed comparisons, and subtract.
  - *One pass instead of two?* When an index is popped, the current index is its next smaller element and the new top is its previous smaller, so you can add its contribution at pop time.
