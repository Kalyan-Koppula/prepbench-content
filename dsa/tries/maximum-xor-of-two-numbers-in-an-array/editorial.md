**Key insight:** decide the answer bit by bit from the top. For each number, a binary trie of all numbers tells you whether some partner has the opposite bit at the current position — greedily taking it is always right, because a higher bit outweighs all lower bits combined.

## Approach

1. Insert every number into a binary trie, bits 30 down to 0, so every root-to-leaf path has the same length.
2. For each `x`, walk from the root. At bit `b`, prefer the child with bit `1 - ((x >> b) & 1)`; if it exists, that bit of the XOR is `1`. Otherwise follow the only child available (the bit is `0`).
3. The walk produces the best XOR achievable with `x` as one side; the answer is the maximum over all `x`.

Every walk succeeds because `x` itself is in the trie, so at least one child always exists.

## Complexity

- Time `O(n · B)` with `B = 31` bits — effectively linear.
- Space `O(n · B)` trie nodes in the worst case.

## Alternatives to mention

- Brute force over all pairs: `O(n²)`, fine for a few thousand numbers.
- Prefix-set trick: build the answer from the top bit, keeping a set of `x >> b` prefixes and testing whether `candidate ^ prefix` is in the set (since `a ^ b = c ⇔ a ^ c = b`). Same `O(n · B)` time without a trie.

## Pitfalls

- Use the same fixed bit width for every number; inserting only the significant bits breaks the alignment.
- In JS, bitwise operators work on 32-bit signed ints. Values up to `2^31 - 1` are safe, and `1 << 30` is the highest bit you need.
