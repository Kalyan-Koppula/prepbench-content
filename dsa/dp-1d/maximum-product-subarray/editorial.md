**Key insight:** multiplying by a negative swaps "largest" and "smallest", so carry **both** the max and the min product of a subarray ending at each index — Kadane's algorithm with two tracks.

## Approach

- **State:** `hi[i]` / `lo[i]` = largest / smallest product of a subarray that **ends at** index `i`.
- **Recurrence:** with `x = nums[i]`,
  - `hi[i] = max(x, hi[i-1]·x, lo[i-1]·x)`
  - `lo[i] = min(x, hi[i-1]·x, lo[i-1]·x)`
  The `x` term means "start fresh here" (covers zeros).
- **Base cases:** `hi[0] = lo[0] = nums[0]`.
- **Order:** left to right. **Answer:** `max(hi[i])` over all `i`.
- **Space optimisation:** each step reads only the previous pair, so keep two variables — compute both new values from the *old* pair before overwriting.

Progression: `O(n²)` "every start, extend right" → realise the subarray-ending-at-`i` state only needs the previous index → `O(n)` with two rolling values.

## Complexity

- Time `O(n)`.
- Space `O(1)`.

## Alternatives to mention

- Prefix/suffix products: scan left-to-right and right-to-left multiplying, resetting to `1` after a zero, and take the max seen. Works because the optimum always extends to a zero, an end, or excludes exactly the first or last negative.

## Pitfalls

- Updating `hi` first and then using the new `hi` to compute `lo`.
- Initialising `best` to `0` breaks `[-2]`.
- Forgetting zeros: the `x` term in the max/min is what lets a subarray restart after one.
