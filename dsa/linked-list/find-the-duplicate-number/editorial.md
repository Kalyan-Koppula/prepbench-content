**Key insight:** read the array as an implicit linked list where index `i` points to index `nums[i]`. Index `0` has no incoming edge (values are `>= 1`), so walking from it traces a "ρ" shape — a tail into a cycle. The duplicate value is the node with two incoming edges: the **entrance** of the cycle. Floyd's algorithm finds it.

## Approach

1. **Phase 1 — meet inside the cycle.** `slow = fast = nums[0]`. Repeat `slow = nums[slow]`, `fast = nums[nums[fast]]` until they're equal.
2. **Phase 2 — find the entrance.** Reset `slow = nums[0]`; move both one step at a time until they meet. That index is the duplicate.

Why phase 2 works: if the tail has length `a` and they met `b` steps into a cycle of length `c`, then `2(a + b) = a + b + kc`, so `a = kc - b`. Walking `a` steps from the start and `a` steps from the meeting point land on the same node — the entrance.

## Complexity

- Time `O(n)`; space `O(1)`. The array is only read.

## Alternatives to mention

- `Set` of seen values: `O(n)` time and space — violates the space limit.
- Sort a copy: `O(n log n)`, and sorting in place violates "don't modify".
- Binary search on the value: count elements `<= mid`; if the count exceeds `mid`, the duplicate is `<= mid`. `O(n log n)` time, `O(1)` space — a solid answer if you can't recall Floyd.
- Negative-marking (`nums[abs(x)] *= -1`) is `O(n)` / `O(1)` but modifies the input.

## Pitfalls

- Starting `slow` and `fast` at different places in phase 1, or resetting to a different origin in phase 2 — both pointers must measure distance from the same start.
- Returning the meeting point of phase 1; it's somewhere in the cycle, not necessarily the entrance.
