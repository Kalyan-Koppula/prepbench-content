**Key insight:** "exactly `k`" isn't monotone, but "at most `k`" is. Count subarrays with at most `k` distinct values, subtract those with at most `k - 1`, and what remains has exactly `k`.

## Approach

1. `atMost(limit)`: a standard window that shrinks while it holds more than `limit` distinct values.
2. After shrinking, the window `[left, right]` is the *longest* valid window ending at `right`, so every start in `[left, right]` is valid — add `right - left + 1`.
3. Answer is `atMost(k) - atMost(k - 1)`. With `k - 1 = 0`, `atMost(0)` is `0`.

## Complexity

- Time `O(n)` — two linear passes.
- Space `O(n)` for the count map in the worst case.

## Alternatives to mention

- Brute force: from each start, extend while the distinct count is `<= k` — `O(n²)`.
- One-pass variant with two left pointers (`leftFar` for "≤ k distinct", `leftNear` for "≤ k-1 distinct"); each `right` contributes `leftNear - leftFar`. Same complexity, one loop — harder to explain cleanly.

## Pitfalls

- Trying to slide one window for "exactly `k`": when the window has `k` values, you can't tell whether shrinking keeps it at `k`, so counts get missed.
- Using `+1` per valid window instead of `+ (right - left + 1)`.
- Since `nums[i] <= n`, an array of counts works instead of a `Map` — but track the distinct count yourself.
