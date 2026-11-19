**Key idea:** flipping at most `k` zeros means you're looking for the longest window that contains **at most `k` zeros**. Grow the window to the right, count its zeros, and shrink from the left whenever the count goes above `k`.

## Recognising the pattern

Rephrasing is the whole trick. "Flip at most `k` zeros and get the longest run of ones" is the same as "the longest contiguous window with at most `k` zeros", and that is the "longest valid window" template from the [Sliding Window](/problems/patterns/sliding-window) sheet in its plainest form. The window state is a single counter.

## Brute force

For each start, extend the end while counting zeros. Stop as soon as there are more than `k`, since longer windows from this start only add zeros. Track the longest valid window. That is the reference brute force below.

Correct because it tries every start and the longest valid end for it. Time `O(n²)`, space `O(1)`.

## Optimal: sliding window with a zero counter

1. `left = 0`, `zeros = 0`, `best = 0`.
2. For each `right`:
   1. If `nums[right]` is 0, `zeros++`.
   2. While `zeros > k`: if `nums[left]` is 0, `zeros--`; then `left++`.
   3. Update `best` with `right - left + 1`.
3. Return `best`.

The invariant after step 2: `[left, right]` is the longest window ending at `right` with at most `k` zeros. Moving `left` further would only shorten it, and any window starting further left would contain the zero that was just dropped.

## Walkthrough

`nums = [1, 1, 0, 0, 1, 1, 1, 0, 1]`, `k = 1`

| right | value | zeros | shrink? | window | length | best |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | 0 | – | [0,0] | 1 | 1 |
| 1 | 1 | 0 | – | [0,1] | 2 | 2 |
| 2 | 0 | 1 | – | [0,2] | 3 | 3 |
| 3 | 0 | 2 | drop up to and including index 2 | [3,3] | 1 | 3 |
| 4 | 1 | 1 | – | [3,4] | 2 | 3 |
| 5 | 1 | 1 | – | [3,5] | 3 | 3 |
| 6 | 1 | 1 | – | [3,6] | 4 | 4 |
| 7 | 0 | 2 | drop index 3 | [4,7] | 4 | 4 |
| 8 | 1 | 1 | – | [4,8] | 5 | 5 |

Answer `5`: flip the zero at index 7 to get `1 1 1 1 1` from index 4 to 8.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Sliding window: time `O(n)`; each index enters once and leaves at most once. Space `O(1)`.

## Edge cases

- `k = 0`: the answer is the longest existing run of ones.
- `k` at least the number of zeros: the whole array, length `n`.
- All zeros with `k > 0`: the answer is `k` (or `n` if `k >= n`).
- All ones: the window never shrinks.

## Common mistakes

- Actually flipping elements in the array instead of counting zeros in the window.
- Decrementing `zeros` when the element leaving the window is a 1.
- Recording `best` before shrinking, which counts an invalid window.

## In the interview

- Say the rephrasing first: "longest window with at most `k` zeros." The rest follows.
- Likely follow-ups:
  - *`k = 1` with a stream of bits?* Track the position of the last zero instead of a counter.
  - *Longest substring with at most `k` letters replaced?* The same idea generalised with letter counts (Longest Repeating Character Replacement).
  - *Return the positions to flip?* Record the window bounds when `best` improves; the zeros inside it are the flips.
