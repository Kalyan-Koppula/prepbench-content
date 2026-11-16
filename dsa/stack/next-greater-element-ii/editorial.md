**Key insight:** run the usual next-greater stack over the array **twice**. The second lap lets elements near the end find their answer near the start, without duplicating the array.

## Approach

1. Keep a stack of indices whose next greater value is unknown; their values are non-increasing from bottom to top.
2. For `i` from `0` to `2n - 1`, look at `nums[i % n]`. Pop every index whose value is smaller and set its answer to the current value.
3. Push `i` only when `i < n`. In the second lap we only resolve leftovers.
4. Anything still on the stack (the maximum, and values equal to it) keeps `-1`.

## Complexity

- Time `O(n)` — `2n` iterations, each index pushed and popped at most once.
- Space `O(n)` for the stack.

## Alternatives to mention

- Brute force: for each index, walk up to `n - 1` steps forward with wrap — `O(n²)`.
- Concatenate `nums` with itself and run the linear version — same idea, `2n` extra memory.

## Pitfalls

- Using `<=` when popping: an equal value isn't "greater".
- Pushing during the second lap, which can make an element its own next greater after a full loop.
