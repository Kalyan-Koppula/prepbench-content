**Key insight:** whether the prefix of length `i` splits depends only on shorter prefixes: it does if some earlier split point `j` is reachable and `s[j..i)` is a word.

## Approach

- **State:** `ok[i]` = the first `i` characters can be split into dictionary words.
- **Recurrence:** `ok[i] = OR over j < i of (ok[j] AND s[j..i) ∈ dict)`. Only `j ≥ i - maxWordLen` can match.
- **Base case:** `ok[0] = true` — the empty prefix needs no words.
- **Order:** `i = 1 … n`; answer `ok[n]`. Break out of the inner loop as soon as one `j` works.
- **Space:** the whole boolean array is needed (any earlier `j` may be read).

Progression: the brute recursion "try every word that matches at position `i`, recurse on the rest" is exponential on inputs like `"aaaa…ab"`; memoising on the start index makes it polynomial; the table above is the bottom-up version.

## Complexity

- Time `O(n · L²)` — `n` end positions × up to `L` start positions × `O(L)` to slice and hash the substring (`L` = longest word).
- Space `O(n)` for the table plus the word set.

## Alternatives to mention

- BFS / DFS over reachable indices with a visited set — the same reachability seen as a graph.
- A **trie** of dictionary words lets you walk forward from each reachable `j` and mark every word end in one pass, avoiding repeated substring hashing.

## Pitfalls

- Greedy longest-match fails (`"aaaa"` with `["aaa","aa"]`).
- Forgetting `ok[0] = true` makes everything false.
- Return type is boolean — "can it be split", not the split itself (that's Word Break II, which needs backtracking over the same table).
