**Key idea:** XOR is maximised by making the **highest** bits 1 first, since a 1 in bit `b` is worth more than all lower bits together. Store every number as a path of bits in a binary trie, highest bit first. For each number, walk the trie preferring the opposite bit at every level; the value built along the way is the best XOR for that number.

## Recognising the pattern

Choosing bit by bit from the top, where each choice dominates everything after it, is a greedy that needs fast "is there a stored number with this bit pattern so far?" queries. A trie over bits answers that, an unusual but classic use of the [Tries](/problems/patterns/tries) sheet.

## Brute force

XOR every pair and keep the maximum. That is the reference brute force below. Time `O(n²)`: with `2 · 10^5` numbers that is 20 billion pairs.

## Optimal: binary trie with greedy walks

1. Insert every number as 31 bits (bit 30 down to bit 0) into a trie where each node has a `zero` and a `one` child.
2. For each number `x`:
   1. Start at the root with `value = 0`.
   2. For each bit `b` from 30 down to 0: let `bit` be `x`'s bit `b`. If the child for the **opposite** bit exists, go there and add `2^b` to `value` (that XOR bit is 1). Otherwise go to the child for the same bit (that XOR bit is 0).
   3. Update the best answer with `value`.
3. Return the best.

The path always exists, because every stored number has a full 31-bit path, so at each level at least one child is present.

**Why greedy works.** Choosing the opposite bit at level `b` guarantees a 1 in that position. Any choice that gives a 0 there loses at least `2^b`, more than every lower bit can give back. So the best partner for `x` is found by taking the opposite bit whenever possible, from the top.

## Walkthrough

`nums = [3, 10, 5, 25, 2, 8]`. In 5 bits: 3 = 00011, 10 = 01010, 5 = 00101, 25 = 11001, 2 = 00010, 8 = 01000.

For `x = 5 (00101)`:

| bit | x's bit | want | available? | XOR bit |
| --- | --- | --- | --- | --- |
| 4 | 0 | 1 | yes (25) | 1 |
| 3 | 0 | 1 | yes (25: 1) | 1 |
| 2 | 1 | 0 | yes (25: 0) | 1 |
| 1 | 0 | 1 | no (25: 0) | 0 |
| 0 | 1 | 0 | no (25: 1) | 0 |

Value `11100 = 28`, which is `5 XOR 25`. No other pair beats it, so the answer is `28`.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Binary trie: time `O(n · 31)`, one insert and one walk per number. Space `O(n · 31)` nodes in the worst case.

## Edge cases

- One element: the answer is 0 (a number XOR itself).
- All numbers equal: 0.
- Large values close to `2^31`: bit 30 is the highest bit used. Building `value` with additions of powers of two avoids sign issues with 32-bit shifts.

## Common mistakes

- Building the trie from the lowest bit, which breaks the greedy argument.
- Using `1 << 31` or other 32-bit shifts that produce negative numbers in JavaScript.
- Walking without the full fixed bit length, so short numbers and long numbers don't line up.

## In the interview

- Start from "the top bit matters most", then introduce the trie as the way to ask "does a number with this prefix exist?".
- Mention the alternative: build the answer bit by bit with a hash set of prefixes, `O(n · 31)` as well.
- Likely follow-ups:
  - *Queries with a limit (max XOR with numbers ≤ m)?* Sort queries and numbers, insert numbers as the limit grows (offline processing).
  - *Maximum XOR of a subarray?* Insert prefix XORs; the XOR of a subarray is the XOR of two prefixes.
