**Key insight:** the set of possible open-paren counts is always a contiguous range `[lo, hi]`, so two integers replace an exponential search over wildcard choices.

## Approach

1. `lo` = fewest unmatched `(` achievable, `hi` = most.
2. `(` → both `+1`. `)` → both `-1`. `*` → `lo - 1` (use it as `)`) and `hi + 1` (use it as `(`).
3. If `hi < 0`, even the most generous choice has an unmatched `)` — return `false`.
4. Clamp `lo` to `0`: a negative count is never a legal state, and the clamp drops exactly those choices.
5. At the end, the string is valid iff `0` is in the range, i.e. `lo === 0`.

Why the range stays contiguous: each step shifts every reachable count by `-1`, `0` or `+1`, and the union of shifted contiguous ranges is contiguous.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- DP / memoised recursion on `(index, open)`: `O(n²)` time — the natural first answer, and it's what the greedy compresses.
- Two stacks (indices of `(` and of `*`): match each `)` with a `(` first, else a `*`; at the end, pair leftover `(` with a later `*`. `O(n)` time and space.

## Pitfalls

- Clamping before checking `hi < 0` hides failures like `")"`.
- Returning `hi === 0` or `lo <= 0 <= hi` without the clamp gives wrong answers on strings like `"*)("`.
