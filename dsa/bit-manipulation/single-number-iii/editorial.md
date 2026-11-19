**Key idea:** XOR everything to get `a ^ b`, where `a` and `b` are the two numbers that appear once. They are different, so some bit of `a ^ b` is 1: a bit where `a` and `b` differ. Split all numbers into two groups by that bit. `a` and `b` land in different groups, every pair lands together, and XORing each group leaves one answer per group.

## Recognising the pattern

Two singles among pairs is the [Single Number](/problems/single-number) trick plus a partition step, from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet. The isolate-lowest-bit expression `x & −x` picks the splitting bit.

## Brute force

Count values in a hash map and collect those seen once. That is the reference brute force below. `O(n)` time, `O(n)` space.

## XOR and split

1. `both` = XOR of all numbers = `a ^ b`.
2. `diff = both & −both`: only the lowest set bit of `both`.
3. For each number: if `(x & diff) ≠ 0`, XOR it into `a`; otherwise into `b`.
4. Return `[a, b]`.

**Why `x & −x` isolates the lowest set bit.** In two's complement, `−x` is `~x + 1`. Inverting flips every bit, and adding 1 carries through the trailing 1s (which were trailing 0s of `x`) up to the lowest 1 of `x`. So `x` and `−x` agree exactly at that bit and differ everywhere above it.

**Why each group XORs to one answer.** The two copies of any paired value have the same bit, so they go to the same group and cancel. `a` and `b` differ in the chosen bit, so each is alone in its group.

## Walkthrough

`nums = [4, 7, 4, 9]`. `both = 7 ^ 9 = 1110₂ = 14`; `diff = 14 & −14 = 0010₂ = 2`.

| x | binary | bit 1 set? | group |
| --- | --- | --- | --- |
| 4 | 0100 | no | b |
| 7 | 0111 | yes | a |
| 4 | 0100 | no | b |
| 9 | 1001 | no | b |

`a = 7`, `b = 4 ^ 4 ^ 9 = 9`. Answer `[7, 9]`.

## Complexity

- Hash map: `O(n)` time, `O(n)` space.
- XOR and split: two passes, `O(n)` time, `O(1)` space.

## Edge cases

- Negative numbers: the bit logic works on two's complement unchanged.
- `both` equal to the smallest 32-bit integer: `−both` overflows to itself in 32-bit arithmetic, and `both & −both` is still the correct single bit (bit 31).
- One of the answers is 0: it ends up alone in its group, XOR 0.

## Common mistakes

- Picking the highest bit with a loop and getting the shift wrong; the lowest bit via `x & −x` is simpler.
- Testing `x & diff === 1` instead of `≠ 0`: the bit may not be bit 0.
- Returning the answers in a fixed order when the problem accepts any order (or the reverse, when it doesn't).

## In the interview

- Explain the partition argument: pairs stay together, the two singles separate.
- Likely follow-ups:
  - *Everything else appears three times?* Count bits modulo 3 per position.
  - *Find a missing and a duplicated number?* The same split, XORing the values with `1..n`.
