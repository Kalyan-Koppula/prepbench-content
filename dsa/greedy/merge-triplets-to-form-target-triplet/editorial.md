**Key insight:** merging only ever increases values, so any triplet that exceeds the target in some coordinate is useless. Merging *all* the remaining ones is the best you can do — if that doesn't hit the target, nothing will.

## Approach

1. Skip every triplet with `t[k] > target[k]` for some `k`.
2. Take the element-wise maximum of all remaining triplets.
3. Return whether it equals `target`.

Why merging all safe triplets is optimal: each safe triplet is `<= target` everywhere, so their max is still `<= target`. Adding more safe triplets can only raise coordinates toward the target, never past it.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- Equivalent phrasing: keep three flags, one per coordinate, set when a safe triplet matches the target exactly in that coordinate. Return `true` if all three are set.
- Trying subsets of triplets is exponential; the monotonicity of `max` is what removes the search.

## Pitfalls

- Forgetting the filter and merging everything — a single overshooting triplet breaks the answer.
- The merged result is written into one of the existing triplets, but the problem only asks whether the target can appear, so you never need to simulate in place.
