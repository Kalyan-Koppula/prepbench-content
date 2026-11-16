**Key insight:** fill positions left to right; at each position, any element not yet used is a valid choice. A `used` flag per index makes that check O(1), and undoing it after recursion lets siblings reuse the element.

## Approach

1. `backtrack()`: if `path` has all `n` elements, record a copy.
2. Otherwise, for each index `i` not yet used: mark it, push `nums[i]`, recurse, then pop and unmark.

### Swap variant

Fix position `k` by swapping each `nums[j]` (`j >= k`) into it, recurse on `k + 1`, then swap back. No `used` array and no `path`, at the cost of mutating the input.

## Complexity

- Time `O(n · n!)`: `n!` leaves, each copied in `O(n)`. Internal nodes add only a constant factor.
- Space `O(n)` for recursion, `path` and `used`, excluding the output.

## Alternatives to mention

- Insertion: permute the rest, then insert the first element into every gap. Neat recursively, but allocates many intermediate arrays.
- Next-permutation iteration on a sorted copy: generates all permutations in lexicographic order with `O(1)` extra space per step.

## Pitfalls

- Forgetting to reset `used[i]` after the recursive call.
- Recording `path` without copying it.
- With duplicate values (Permutations II), you'd sort and skip `nums[i] === nums[i - 1] && !used[i - 1]`.
