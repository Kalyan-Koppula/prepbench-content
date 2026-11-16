**Key insight:** brackets close in reverse order of opening — last opened, first closed — which is exactly a stack.

## Approach

1. Map each closer to its opener.
2. Scan `s`: push openers. On a closer, pop the top; if it isn't the matching opener (or the stack was empty), return `false`.
3. At the end the stack must be empty — leftover openers were never closed.

## Complexity

- Time `O(n)`, space `O(n)` in the worst case (all openers).

## Alternatives to mention

- Repeatedly delete `()`, `[]`, `{}` until nothing changes: `O(n²)`, but obviously correct.
- A single counter works only when there is **one** bracket type.

## Pitfalls

- Returning `true` without checking the stack is empty (`"(("`).
- A closer on an empty stack — `pop()` returns `undefined`, which must count as a mismatch.
- Odd length can be rejected immediately, a cheap early exit worth mentioning.
