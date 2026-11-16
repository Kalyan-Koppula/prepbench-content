**Key insight:** for every possible length, only the *smallest* tail value matters — a smaller tail is easier to extend. Keeping those tails sorted turns each step into a binary search.

## Approach 1 — O(n²) DP (say this first)

- **State:** `len[i]` = length of the longest strictly increasing subsequence **ending at** index `i`.
- **Recurrence:** `len[i] = 1 + max(len[j])` over `j < i` with `nums[j] < nums[i]` (or `1` if none).
- **Base case:** every `len[i]` starts at `1` (the element alone).
- **Order:** `i` left to right, inner `j < i`. **Answer:** `max(len)` — the LIS can end anywhere.
- **Space:** `O(n)`; no rolling trick, since any earlier `j` can be read.

Progression: the brute "take or skip each element, remembering the last taken value" is `O(2ⁿ)`; memoising on `(i, lastIndex)` is `O(n²)` states; the `len[i]` table above is the tidy bottom-up form.

## Approach 2 — patience sorting, O(n log n)

1. Maintain `tails`, where `tails[k]` is the smallest last value among all increasing subsequences of length `k + 1`. It is always strictly increasing.
2. For each `x`, binary-search the first `tails[k] >= x`:
   - none → `x` extends the longest subsequence: append it;
   - otherwise → overwrite `tails[k] = x` (same length, smaller tail).
3. The answer is `tails.length`.

`tails` is **not** an actual subsequence — only its length is meaningful. To reconstruct one, store for each element the index it replaced and a parent pointer.

## Complexity

- DP: time `O(n²)`, space `O(n)`.
- Patience sorting: time `O(n log n)` (one binary search per element), space `O(n)`.

## Pitfalls

- Strictly increasing → search for the first tail `>= x` (lower bound). Using `> x` (upper bound) computes the longest **non-decreasing** subsequence.
- Returning `len[n - 1]` instead of `max(len)`.

## Follow-ups

- Number of LIS: carry a count alongside `len[i]`.
- Russian-doll envelopes: sort by width ascending and height **descending**, then LIS on heights.
