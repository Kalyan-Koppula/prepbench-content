**Key insight:** it's 3Sum with one more nested loop — sort, fix the first two values with loops, find the remaining pair with two pointers, and skip duplicates at all three levels.

## Approach

1. Sort ascending.
2. Loop `i` over the array, skipping `nums[i] === nums[i - 1]`.
3. Loop `j` from `i + 1`, skipping `j > i + 1 && nums[j] === nums[j - 1]`.
4. Two pointers `l = j + 1`, `r = n - 1` looking for `target - nums[i] - nums[j]`. On a match, record, move both, and skip duplicate `l` values.

## Complexity

- Time `O(n³)` — two loops around a linear scan.
- Space `O(1)` extra beyond the output and sort.

## Alternatives to mention

- Generic `kSum(start, k, target)`: recurse down to the 2-sum base case. Same complexity, nicer to extend — a strong answer if the interviewer asks "and 5Sum?".
- Pair-sum hash map (store all pair sums, look up complements): `O(n²)` average but deduplication of index-disjoint quadruplets is fiddly.

## Pitfalls

- The inner skip must be `j > i + 1` (not `j > 0`), or you'd skip valid quadruplets like `[2, 2, 2, 2]`.
- Values up to `10^9` mean sums up to `4 · 10^9` — overflows 32-bit ints in Java/C++. In JS it's exact (below `2^53`), but say you'd use `long` elsewhere.
