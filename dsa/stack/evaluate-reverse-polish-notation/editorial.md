**Key insight:** in postfix, every operator consumes the two most recent unconsumed values — that's a stack. No precedence or parentheses to worry about.

## Approach

1. Scan tokens left to right.
2. Number → push it.
3. Operator → pop `b` (top), then `a`, push `a op b`.
4. The single value left on the stack is the answer.

## Complexity

- Time `O(n)`, space `O(n)` for the stack.

## Pitfalls

- Operand order: the first pop is the **right** operand. `a - b` and `a / b`, not `b - a`.
- Truncation: `Math.floor(-7 / 2)` is `-4`; the problem wants `-3`. Use `Math.trunc` (or `(a / b) | 0` within 32-bit range).
- Detecting operators with something like `isNaN(tok)` breaks on `"-"` vs `"-3"` if done carelessly — compare against the four operator strings explicitly.

## Follow-ups

- Infix to postfix (shunting-yard) or evaluating an infix string directly with two stacks — the "Basic Calculator" family.
