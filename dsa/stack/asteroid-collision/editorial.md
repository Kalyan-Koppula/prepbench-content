**Key insight:** the stack holds the survivors so far. Only an incoming left-mover can collide, and it hits the nearest right-mover first — the top of the stack.

## Approach

1. For each asteroid `a`:
   - If `a > 0`, or the stack is empty, or the top is moving left, push it — no collision possible.
   - Otherwise (`a < 0` and top `> 0`): while that holds, compare sizes. Smaller top → pop and continue. Equal → pop and `a` dies. Larger top → `a` dies.
2. Push `a` if it survived.
3. The stack, bottom to top, is the final row.

## Complexity

- Time `O(n)` — each asteroid is pushed and popped at most once.
- Space `O(n)` for the stack.

## Alternatives to mention

- Repeated simulation of adjacent collisions: `O(n²)`, but a handy cross-check.

## Pitfalls

- Treating `[-5, 5]` as a collision — they move apart.
- Forgetting the equal-size case destroys **both**.
- Breaking out after one pop: a big left-mover can destroy several right-movers in a row.
