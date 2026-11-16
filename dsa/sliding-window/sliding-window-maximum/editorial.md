**Key insight:** an element is useless once a newer, larger-or-equal element enters the window — it will leave first and never be the max. Keep only the "still useful" indices in a deque with decreasing values; the front is always the answer.

## Approach

1. For each index `i`, pop from the back while `nums[back] <= nums[i]`, then push `i`.
2. If the front index is `<= i - k`, it has left the window — drop it.
3. Once `i >= k - 1`, the front of the deque is the window maximum.

JS has no built-in deque; an array with a moving `head` index gives O(1) front removal (`shift()` is O(n)).

## Complexity

- Time `O(n)` — every index is pushed and popped at most once.
- Space `O(k)` live deque entries plus the output (the head-index trick leaves dead slots behind, so the backing array can reach `O(n)`).

## Alternatives to mention

- Brute force: max of each window, `O(n·k)`.
- Max-heap of `(value, index)` with lazy deletion of stale indices: `O(n log n)`.
- Block decomposition: prefix-max and suffix-max over blocks of size `k`; the window max is `max(suffix[i], prefix[i + k - 1])`. `O(n)` without a deque.

## Pitfalls

- Storing values instead of indices — you can't tell when a value has left the window.
- Using `Array.prototype.shift()` in a loop, which quietly makes it `O(n·k)` in the worst case.
- Emitting a result before the first window is full.
