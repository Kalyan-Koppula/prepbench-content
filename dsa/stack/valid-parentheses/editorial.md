**Key idea:** the closer you meet must match the **most recent** opener that is still open. A stack tracks exactly that: push every opener, and on a closer pop the top and check that the types match. The string is valid if every closer matched and the stack ends empty.

## Recognising the pattern

Nesting means "last opened, first closed", which is the definition of a stack. This is the textbook first problem of the [Stack](/problems/patterns/stack) sheet: whenever a later element must be matched against the latest unmatched earlier one, reach for a stack.

## Brute force

Repeatedly find an adjacent matched pair (`()`, `[]` or `{}`) and delete it. A balanced string shrinks to nothing; an unbalanced one gets stuck. That is the reference brute force below.

Correct because a balanced string always contains an adjacent matched pair (its innermost pair), and removing it leaves a balanced string. Time `O(n²)`: up to `n / 2` deletions, each rebuilding a string of length `O(n)`. Space `O(n)`.

## Optimal: one pass with a stack

1. Create an empty stack.
2. For each character:
   1. If it is an opener, push it.
   2. If it is a closer: if the stack is empty, return `false` (nothing to close). Otherwise pop the top; if it isn't the matching opener, return `false`.
3. Return `true` if the stack is empty, `false` otherwise (some openers were never closed).

The invariant: the stack holds, in order, the openers that are still open. A valid closer always closes the innermost one, which is on top.

## Walkthrough

`s = "{[()]}("`

| i | char | stack before | action | stack after |
| --- | --- | --- | --- | --- |
| 0 | { | [] | push | [{] |
| 1 | [ | [{] | push | [{, [] |
| 2 | ( | [{, [] | push | [{, [, (] |
| 3 | ) | [{, [, (] | pop ( ✓ | [{, [] |
| 4 | ] | [{, [] | pop [ ✓ | [{] |
| 5 | } | [{] | pop { ✓ | [] |
| 6 | ( | [] | push | [(] |

The stack isn't empty at the end, so the answer is `false`. Without the last `(`, it would be `true`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Stack: time `O(n)`, one push or pop per character. Space `O(n)` in the worst case, when the string is all openers.

## Edge cases

- Odd length: can never be balanced. You can return `false` immediately as a shortcut.
- Starts with a closer: the stack is empty at the first closer.
- Only openers: the loop passes, but the stack isn't empty at the end.
- Right types, wrong order, like `"([)]"`: the `)` pops `[`, a mismatch.

## Common mistakes

- Counting each bracket type separately. `"([)]"` has balanced counts but invalid nesting.
- Forgetting the final empty-stack check.
- Popping from an empty stack without checking, which in some languages throws and in JavaScript returns `undefined`.

## In the interview

- Say why a stack: the closer must match the most recently opened bracket.
- Likely follow-ups:
  - *Only one bracket type?* A counter is enough: increment on `(`, decrement on `)`, and fail if it goes negative.
  - *Minimum insertions or removals to make it valid?* Track unmatched openers and closers with counters or a stack.
  - *Longest valid parentheses substring?* A stack of indices, with the index of the last unmatched `)` as a base.
