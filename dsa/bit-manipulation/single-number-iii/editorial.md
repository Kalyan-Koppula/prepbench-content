**Key insight:** XOR of the whole array is `a ^ b`. Any `1` bit in it is a position where `a` and `b` differ, so partitioning by that bit puts them in different groups — and duplicates always land together.

## Approach

1. `both` = XOR of all elements = `a ^ b` (non-zero because `a !== b`).
2. `diff = both & -both` isolates the lowest set bit.
3. XOR the elements with that bit set into `a`, the rest into `b`. Pairs cancel within each group, leaving one unique value per group.

## JS details

- `&` and unary `-` interact through 32-bit coercion. With the extreme `both = -2^31`, `-both` is `2^31`, which `&` coerces back to `-2^31`, so `diff` is still the single top bit — correct.
- Test the group with `if (x & diff)`, not `(x & diff) === 1`: the bit can be anywhere.

## Complexity

- Time `O(n)` — two passes. Space `O(1)`.

## Alternatives to mention

- Hash map of counts: `O(n)` space.
- Sort and scan: `O(n log n)`.

## Pitfalls

- Using `Math.log2` or loops over bits to find a set bit works but is clunkier than `x & -x`.
- The answer pair can be in either order; the tests accept both.
