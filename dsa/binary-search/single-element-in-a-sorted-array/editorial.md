**Key insight:** to the left of the single element, every pair occupies `(even, odd)` indices; from the single element onwards, pairs shift to `(odd, even)`. Binary search for where the pattern breaks.

## Approach

1. `lo = 0`, `hi = n - 1`.
2. While `lo < hi`, take `mid` and force it even (`if (mid % 2 === 1) mid--`).
3. If `nums[mid] === nums[mid + 1]`, the pairing is intact through `mid + 1`, so the single element is to the right: `lo = mid + 2`.
4. Otherwise the break is at `mid` or before it: `hi = mid`.
5. Return `nums[lo]`.

Forcing `mid` even keeps `lo` on even indices throughout, and the single element always sits at an even index.

## Complexity

- Time `O(log n)`, space `O(1)`.

## Alternatives to mention

- XOR every element — pairs cancel, the single value remains. `O(n)` time, `O(1)` space; great for the unsorted variant, but it ignores the sortedness and misses the `O(log n)` requirement.
- Scan in steps of two looking for `nums[i] !== nums[i + 1]`: also `O(n)`.

## Pitfalls

- Using `mid ^ 1` as "partner index" is a neat alternative (`nums[mid] === nums[mid ^ 1]` → go right), but explain it — it confuses people who haven't seen it.
- `mid + 1` is always in range here because `mid < hi` and `mid` is rounded down.
