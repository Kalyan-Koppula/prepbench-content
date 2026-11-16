**Key insight:** reversed digits mean the heads line up as the ones column, so it's grade-school addition walking left to right — sum the two digits plus carry, emit `sum % 10`, carry `⌊sum / 10⌋`.

## Approach

1. `dummy` node, `tail = dummy`, `carry = 0`.
2. While `l1 || l2 || carry`:
   - `sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry`;
   - append `new ListNode(sum % 10)`, set `carry = Math.floor(sum / 10)`;
   - advance whichever lists remain.
3. Return `dummy.next`.

## Complexity

- Time `O(max(m, n))`.
- Space `O(1)` besides the output list of length `max(m, n) + 1` at most.

## Alternatives to mention

- Convert to numbers, add, convert back: breaks on 100-digit inputs (beyond `Number.MAX_SAFE_INTEGER`). `BigInt` would work but misses the point of the question — call it out.

## Pitfalls

- Dropping the final carry: `[5] + [5]` must be `[0,1]`. Including `carry` in the loop condition handles it.
- Lists of different lengths — treat a missing digit as `0` rather than stopping early.

## Follow-ups

- Digits stored most-significant first (Add Two Numbers II): reverse both lists first, or push digits onto two stacks.
