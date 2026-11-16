**Key insight:** walk both trees in lockstep; the first mismatch in shape or value decides the answer.

## Approach

1. Both `null` → `true`.
2. Exactly one `null`, or the values differ → `false`.
3. Otherwise recurse: `same(p.left, q.left) && same(p.right, q.right)`.

`&&` short-circuits, so the walk stops at the first difference.

## Complexity

- Time `O(min(n, m))` — you never go further than the smaller tree; `O(n)` in the worst case.
- Space `O(h)` recursion stack.

## Alternatives to mention

- Iterative: a queue/stack of `[a, b]` pairs, applying the same three checks per pair.
- Serialising both trees (with explicit null markers) and comparing strings works but uses `O(n)` extra space. Without null markers, different shapes can serialise identically — a classic trap.

## Follow-ups

- This is the building block for *Subtree of Another Tree* and *Symmetric Tree* (compare `a.left` with `b.right`).
