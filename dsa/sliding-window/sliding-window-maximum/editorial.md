**Key idea:** keep a deque of indices whose values **decrease** from front to back. When a new value arrives, remove every smaller value from the back: they can never be a window maximum again. Remove the front when it slides out of the window. The front is always the current maximum.

## Recognising the pattern

A fixed-size window that moves one step at a time is the fixed template from the [Sliding Window](/problems/patterns/sliding-window) sheet. The catch is the summary: a maximum can't be updated in `O(1)` when the maximum itself leaves the window, because you don't know the second largest. A **monotonic deque** solves this by keeping exactly the values that could still become a maximum.

## Brute force

For each window, scan its `k` values for the largest. That is the reference brute force below.

Correct by definition. Time `O(n · k)`, which for `n = 10^5` and large `k` is about `10^10`. Space `O(1)` beyond the output.

## Better: a max-heap

Push `(value, index)` pairs into a max-heap. Before reading the top, pop entries whose index has left the window. Time `O(n log n)`, space `O(n)`.

## Optimal: monotonic deque

Observation: if `j < i` and `nums[j] <= nums[i]`, then `nums[j]` can never be the maximum of any window that contains `i`. And every future window that contains `j` also contains `i`, since windows move right. So `j` is useless the moment `i` arrives.

1. Keep a deque of indices with strictly decreasing values from front to back.
2. For each `i`:
   1. Pop from the back while the value there is `<= nums[i]`.
   2. Push `i` at the back.
   3. If the front index is `<= i − k`, it has slid out; remove it from the front.
   4. Once `i >= k − 1`, append `nums[front]` to the result.
3. Return the result.

In JavaScript, `Array.prototype.shift` is `O(n)`, so the deque is an array plus a `head` index: "remove from the front" is `head++`. Most languages have a real deque (`ArrayDeque` in Java, `deque` in C++ and Python).

## Walkthrough

`nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3`. The deque is shown as values.

| i | value | pops from back | deque after | front expired? | output |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | – | [1] | no | |
| 1 | 3 | 1 | [3] | no | |
| 2 | −1 | – | [3, −1] | no | 3 |
| 3 | −3 | – | [3, −1, −3] | no | 3 |
| 4 | 5 | −3, −1, 3 | [5] | no | 5 |
| 5 | 3 | – | [5, 3] | no | 5 |
| 6 | 6 | 3, 5 | [6] | no | 6 |
| 7 | 7 | 6 | [7] | no | 7 |

Answer `[3, 3, 5, 5, 6, 7]`. (Expiry matters for inputs like `[5, 4, 3, 2]` with `k = 2`, where 5 must leave the front at `i = 2`.)

## Complexity

- Brute force: time `O(n · k)`, space `O(1)`.
- Heap: time `O(n log n)`, space `O(n)`.
- Monotonic deque: time `O(n)`; each index is pushed once and removed at most once. Space `O(k)` for the deque.

## Edge cases

- `k = 1`: every element is its own maximum.
- `k = n`: one window, the global maximum.
- Decreasing input: nothing is popped from the back, and the front expires every step.
- Equal values: popping with `<=` keeps only the newest copy, which also expires last.

## Common mistakes

- Storing values instead of indices, which makes it impossible to tell when the front has expired.
- Using `<` instead of `<=` when popping. It still works, but keeps redundant equal values.
- Using `shift()` in JavaScript and turning the solution quadratic.
- Emitting output before the first full window.

## In the interview

- Explain why smaller values behind a new one are useless: that sentence justifies the whole structure.
- Mention the heap as the easier `O(n log n)` alternative.
- Likely follow-ups:
  - *Window minimum?* Keep increasing values instead.
  - *Max and min together (for "max − min ≤ limit" windows)?* Keep two deques, one of each kind.
  - *Jump game with a window of reachable scores?* The same deque appears inside a DP.
