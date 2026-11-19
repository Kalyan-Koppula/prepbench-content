**Key idea:** the digits are stored ones first, which is exactly the order you add columns by hand. Walk both lists together, add the two digits and the carry, write `sum % 10` into a new node, and carry `floor(sum / 10)` into the next column. Continue while either list or the carry remains.

## Recognising the pattern

Building a new list digit by digit with a **dummy head** and a `tail` pointer is a staple of the [Linked List](/problems/patterns/linked-list) sheet. The reversed digit order is a gift: no reversing or padding is needed.

## Brute force

Converting each list to a number and adding them fails: inputs can have 100 digits, far beyond what a 64-bit integer or a double holds exactly. (A big-integer type works, but sidesteps the question.)

The reference brute force below copies the digits into two arrays, adds the arrays column by column, and builds a list from the result. Time `O(m + n)`, space `O(m + n)` for the arrays.

## Optimal: column addition while walking both lists

1. `dummy`, `tail = dummy`, `carry = 0`.
2. While `l1` or `l2` is not null, or `carry` is not 0:
   1. `sum = carry`, plus `l1.val` if `l1` exists (then advance `l1`), plus `l2.val` if `l2` exists (then advance `l2`).
   2. Append a node with `sum % 10`.
   3. `carry = floor(sum / 10)`.
3. Return `dummy.next`.

**Why include `carry` in the loop condition?** When both numbers end but a carry remains, as in `5 + 5`, one more node must be added. The condition handles it without special code after the loop.

The carry is never more than 1: the largest column is `9 + 9 + 1 = 19`.

## Walkthrough

`l1 = [2, 4, 3]` (342), `l2 = [5, 6, 4]` (465)

| column | digits | carry in | sum | node | carry out |
| --- | --- | --- | --- | --- | --- |
| ones | 2 + 5 | 0 | 7 | 7 | 0 |
| tens | 4 + 6 | 0 | 10 | 0 | 1 |
| hundreds | 3 + 4 | 1 | 8 | 8 | 0 |

Result `[7, 0, 8]`, which is 807 = 342 + 465.

## Complexity

- Digit arrays: time `O(m + n)`, space `O(m + n)`.
- Walking both lists: time `O(max(m, n))`, space `O(1)` beyond the output list.

## Edge cases

- Lists of different lengths: the shorter one simply contributes 0 once it ends.
- A final carry, like `[9, 9] + [1]`: gives `[0, 0, 1]`.
- Both numbers 0: `[0]`.

## Common mistakes

- Converting to numbers and overflowing.
- Stopping when the shorter list ends.
- Forgetting the final carry.

## In the interview

- Point out why direct conversion fails (100 digits).
- Likely follow-ups:
  - *Digits stored most significant first (Add Two Numbers II)?* Reverse both lists first, or push digits onto two stacks and add from the tops, building the result at the head.
  - *Subtract or multiply?* The same column-by-column idea with borrows, or the grade-school multiplication grid (Multiply Strings).
