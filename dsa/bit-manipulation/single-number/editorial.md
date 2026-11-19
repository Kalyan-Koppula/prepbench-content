**Key idea:** XOR every number together. XOR has three properties that make this work: `x ^ x = 0`, `x ^ 0 = x`, and the order doesn't matter. So every value that appears twice cancels itself out, wherever its copies are, and only the single number survives.

## Recognising the pattern

"Every element appears twice except one", with `O(1)` extra space required, is the signature XOR trick from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet. Without the space limit, a hash map of counts would do.

## Brute force

Count each value in a hash map, then return the one with count 1. That is the reference brute force below. `O(n)` time but `O(n)` space. Sorting and scanning adjacent pairs uses no map but costs `O(n log n)`.

## XOR everything

1. `result = 0`.
2. For each `x`: `result ^= x`.
3. Return `result`.

**Why the order doesn't matter.** XOR works on each bit independently, and for a single bit it is addition modulo 2. Addition is commutative and associative, so `a ^ b ^ a = a ^ a ^ b = 0 ^ b = b`.

**Negative numbers.** XOR acts on the two's complement bits, so negatives cancel exactly like positives.

## Walkthrough

`nums = [5, −2, 5, 9, 9]`

| x | result after (value) |
| --- | --- |
| 5 | 5 |
| −2 | 5 ^ −2 |
| 5 | −2 (the 5s cancel) |
| 9 | −2 ^ 9 |
| 9 | −2 (the 9s cancel) |

Answer `−2`. The intermediate values look meaningless; only the final one matters.

## Complexity

- Hash map: `O(n)` time, `O(n)` space.
- Sort and scan: `O(n log n)` time, `O(1)` extra space if sorting in place.
- XOR: `O(n)` time, `O(1)` space.

## Edge cases

- One element: it is the answer.
- Zero as the single number: XOR returns 0 correctly.
- Negative values: handled by two's complement.

## Common mistakes

- Using a sum-based trick (`2 · sum(set) − sum(all)`), which needs a set and can overflow.
- Starting the XOR at a value other than 0.

## In the interview

- State the three XOR properties; they are the proof.
- Likely follow-ups:
  - *Every other element appears three times (Single Number II)?* Count each bit position modulo 3; the leftover bits form the answer.
  - *Two single numbers (Single Number III)?* XOR gives `a ^ b`; split by any bit where they differ ([Single Number III](/problems/single-number-iii)).
  - *Missing number in 0..n?* XOR the values with all the indices ([Missing Number](/problems/missing-number)).
