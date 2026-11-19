**Key idea:** process asteroids left to right and keep the survivors on a stack. A collision can only happen when a left-moving asteroid meets a right-moving one on top of the stack. Resolve those collisions one at a time from the top until the newcomer explodes or nothing is left to hit.

## Recognising the pattern

Each new asteroid interacts with the **most recent** survivors first, and an explosion can expose an older survivor for the next collision. "Compare with the latest, possibly remove it, repeat" is a stack, exactly like matching brackets, one of the core shapes in the [Stack](/problems/patterns/stack) sheet.

## Brute force

Repeatedly look for an adjacent pair where a right-mover is immediately followed by a left-mover, resolve it, and start over. Stop when no such pair exists. That is the reference brute force below.

Correct because only such adjacent pairs can collide, and resolving one never creates a pair that the final state wouldn't also resolve. Time `O(n²)`: up to `n` collisions, each costing `O(n)` to find and rebuild. Space `O(n)`.

## Optimal: stack of survivors

1. Empty stack.
2. For each asteroid `current`:
   1. `alive = true`.
   2. While `alive`, `current < 0`, and the top of the stack is `> 0`:
      - If the top is smaller than `|current|`, pop it and keep going.
      - If they are equal, pop it and set `alive = false`.
      - If the top is bigger, set `alive = false`.
   3. If still `alive`, push `current`.
3. Return the stack.

**Who can collide.** Two asteroids collide only if the left one moves right and the right one moves left. A right-mover arriving never hits anything on the stack (everything there is to its left). A left-mover never hits left-movers on the stack (they travel in the same direction). So only the case "left-mover arriving, right-mover on top" needs work.

## Walkthrough

`asteroids = [5, 10, -5, -12, 3]`

| current | stack before | collisions | stack after |
| --- | --- | --- | --- |
| 5 | [] | – | [5] |
| 10 | [5] | – | [5, 10] |
| −5 | [5, 10] | 10 beats 5 → −5 explodes | [5, 10] |
| −12 | [5, 10] | 12 beats 10, 12 beats 5 | [−12] |
| 3 | [−12] | different directions apart | [−12, 3] |

Answer `[-12, 3]`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Stack: time `O(n)`, each asteroid pushed and popped at most once. Space `O(n)`.

## Edge cases

- All moving the same direction: no collisions, the output equals the input.
- Left-movers before right-movers, like `[-2, -1, 1, 2]`: they move apart, no collisions.
- Equal sizes meeting: both disappear.
- A large left-mover that wipes out the whole stack: the loop stops when the stack is empty, then pushes it.

## Common mistakes

- Treating `[-5, 5]` as a collision. They are moving apart.
- Stopping after one collision, when the survivor may hit the next one on the stack.
- Pushing the newcomer after it has exploded.

## In the interview

- State who can collide and why, before writing the loop.
- Likely follow-ups:
  - *Return the number of survivors?* The stack's size.
  - *Asteroids with different speeds?* A simulation in time order with a priority queue of collision times; a much harder problem.
