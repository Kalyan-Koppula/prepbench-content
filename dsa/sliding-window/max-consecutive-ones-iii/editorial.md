**Key insight:** flipping zeros is a distraction — the question is "longest subarray with at most `k` zeros", a textbook variable window.

## Approach

1. Extend `right`, counting zeros in the window.
2. While `zeros > k`, advance `left`, decrementing the count when a zero leaves.
3. The window is now valid; record its length.

## Complexity

- Time `O(n)` — each pointer moves forward at most `n` times.
- Space `O(1)`.

## Alternatives to mention

- Brute force: every start, extend until the `(k+1)`-th zero — `O(n²)`.
- Non-shrinking variant: replace `while` with `if` so the window slides at the best size; same answer, slightly less work.
- Prefix count of zeros + binary search on the left edge: `O(n log n)`.

## Pitfalls

- `k = 0` degenerates to "longest run of ones", which may be `0` if the array is all zeros.
- `k >= number of zeros` — the answer is the whole array.
