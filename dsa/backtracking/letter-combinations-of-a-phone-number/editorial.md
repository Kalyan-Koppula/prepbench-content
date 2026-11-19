**Key idea:** the answer has one letter per digit, and each position independently takes one of that digit's 3 or 4 letters. Backtrack position by position: for digit `i`, try each of its letters, recurse to the next digit, and record the string when all digits have a letter.

## Recognising the pattern

A fixed number of positions, each with its own small set of choices, is the simplest shape in the [Backtracking](/problems/patterns/backtracking) sheet: a full product of choices, with no pruning and no duplicates to worry about.

## Alternative: iterative product (shown below)

Start with `[""]`. For each digit, replace the list with every existing string extended by each of the digit's letters. After the last digit, the list holds all combinations. That is the reference brute force below. Same cost, built breadth-first.

## Backtracking

1. If `digits` is empty, return `[]` (not `[""]`).
2. `explore(i)`:
   1. If `i == digits.length`, record the joined path.
   2. For each letter of `digits[i]`: push it, `explore(i + 1)`, pop.
3. `explore(0)`.

The keypad is a small lookup table indexed by digit.

## Walkthrough

`digits = "23"` (2 → abc, 3 → def)

| first letter | second letters | recorded |
| --- | --- | --- |
| a | d, e, f | ad, ae, af |
| b | d, e, f | bd, be, bf |
| c | d, e, f | cd, ce, cf |

Nine combinations: `3 × 3`.

## Complexity

- Time `O(n · 4^n)` for `n` digits: up to `4^n` strings (digits 7 and 9 have four letters), each built in `O(n)`.
- Space `O(n)` for the recursion and path, plus the output.

## Edge cases

- Empty input: `[]`.
- One digit: its letters, one per string.
- Digits with four letters (7, 9): the loop simply has four iterations.

## Common mistakes

- Returning `[""]` for empty input.
- Building strings with `+` inside deep recursion and keeping references to partial strings incorrectly. Joining a path at the end, or passing new strings down, both work.
- Mapping digits off by one (the keypad starts at 2).

## In the interview

- Say the count first (`3^a · 4^b`), then the backtracking.
- Likely follow-ups:
  - *Only combinations that are dictionary words?* Walk a trie of the dictionary alongside the digits and prune dead prefixes.
  - *Count only?* Multiply the letter counts.
