**Key idea:** in postfix notation every operator applies to the two values just before it. Read left to right, push numbers on a stack, and when an operator arrives pop two values, apply it, and push the result. The one value left at the end is the answer.

## Recognising the pattern

Postfix exists precisely so that a stack can evaluate it without parentheses or precedence rules. "Apply this operation to the most recent results" is the core use case in the [Stack](/problems/patterns/stack) sheet, the same machinery that calculators and compilers use.

## Brute force

Repeatedly find the leftmost "number, number, operator" triple, compute it, and replace the three tokens with the result, until one value remains. That is the reference brute force below.

Correct because each such triple is a sub-expression that can be evaluated on its own. Time `O(n²)`: up to `n / 2` reductions, each scanning and rebuilding the list. Space `O(n)`.

## Optimal: an operand stack

1. Create an empty stack.
2. For each token:
   1. If it is a number, push it.
   2. If it is an operator, pop `right`, then pop `left` (the right operand was pushed last), compute `left op right`, and push the result.
3. Return the single value on the stack.

**Operand order matters** for `-` and `/`. The tokens `["5", "2", "-"]` mean `5 - 2`; popping gives `right = 2` first, then `left = 5`.

**Integer division toward zero.** The problem truncates toward zero (`7 / -2 = -3`). In JavaScript use `Math.trunc(left / right)`; `Math.floor` would give `-4`. In Java and C++, integer division already truncates toward zero.

## Walkthrough

`tokens = ["4", "13", "5", "/", "+"]`, meaning `4 + 13 / 5`.

| token | action | stack after |
| --- | --- | --- |
| 4 | push | [4] |
| 13 | push | [4, 13] |
| 5 | push | [4, 13, 5] |
| / | pop 5 and 13, push trunc(13 / 5) = 2 | [4, 2] |
| + | pop 2 and 4, push 4 + 2 = 6 | [6] |

Answer `6`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Stack: time `O(n)`, constant work per token. Space `O(n)` for the stack (about half the tokens in the worst case).

## Edge cases

- A single number token: returned as is.
- Negative number tokens like `"-3"`: they are numbers, not the `-` operator, so check for the exact operator strings.
- Division with negative operands: truncation, not flooring.
- Long chains of operators at the end, like `["1","2","3","+","+"]`: the stack shrinks one value per operator.

## Common mistakes

- Swapping the operands, so `5 2 -` gives `-3`.
- Using `Math.floor` for division.
- Treating any token that starts with `-` as an operator.

## In the interview

- Explain why postfix needs no precedence handling: the order of operations is already encoded.
- Likely follow-ups:
  - *Infix input with precedence and parentheses?* Convert with the shunting-yard algorithm (an operator stack), or evaluate with two stacks (Basic Calculator).
  - *Prefix (Polish) notation?* Scan from right to left with the same stack logic.
  - *Build the expression tree instead?* Push nodes instead of numbers; an operator pops two children.
