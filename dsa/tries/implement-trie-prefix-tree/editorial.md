**Key insight:** share storage between words with a common prefix — a tree where each edge is a letter, so walking a string is one step per character, and a flag on the node marks "a word ends here".

## Approach

1. A node holds a map from character to child node, plus a boolean `isEnd`.
2. `insert`: walk from the root, creating missing children, then set `isEnd` on the last node.
3. `search` and `startsWith` share a `walk` helper that returns the node reached by following the string, or `null` if a letter is missing.
   - `search` additionally requires `isEnd`.
   - `startsWith` only needs the node to exist.

## Complexity

- Time `O(L)` per operation, where `L` is the argument length.
- Space `O(total characters inserted)` in the worst case (no shared prefixes).

## Alternatives to mention

- A `Set` of words handles `search` in `O(L)`, but `startsWith` would scan every word: `O(N · L)`.
- Children as a fixed array of 26 instead of a `Map`: faster constant factor, more memory per node. Either is fine; say which you picked and why.

## Pitfalls

- Inserting `"apple"` does not make `"app"` a word — `search("app")` is `false` until `"app"` is inserted, but `startsWith("app")` is `true`.
- Re-inserting a word must be harmless.
