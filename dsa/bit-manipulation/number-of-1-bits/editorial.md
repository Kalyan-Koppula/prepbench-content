**Key insight:** `n & (n - 1)` clears exactly the lowest set bit, so a loop that applies it until `n` is zero runs once per `1` bit (Brian Kernighan's trick).

## Approach

1. While `n !== 0`: `n &= n - 1`, `count++`.
2. Return `count`.

Why it works: subtracting `1` flips the lowest set bit to `0` and every `0` below it to `1`; AND-ing with the original wipes all of those, removing just that one bit.

## Complexity

- Time `O(k)` for `k` set bits (at most 31 here), space `O(1)`.

## Alternatives to mention

- Shift-and-mask over all 32 bits: `count += n & 1; n >>>= 1`. Always 32 iterations. Use `>>>`, not `>>`, so it also works if the input were negative.
- Lookup table of popcounts for each byte (or 16-bit chunk): 4 lookups per call — the answer to the "called millions of times" follow-up.
- SWAR bit-parallel counting (`n - ((n >>> 1) & 0x55555555)` …) — mention as the hardware-free `O(1)` trick.
- `n.toString(2)` and count the `1`s — fine in practice, not what's being tested.
