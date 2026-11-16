**Key insight:** store words in a trie; a literal letter follows one edge, while a `.` branches into every child — a DFS over the trie that only fans out at wildcards.

## Approach

1. `addWord` is a normal trie insert that marks the final node with `isEnd`.
2. `search` runs `dfs(node, i)`:
   - If `i` reached the end of the pattern, succeed only if `node.isEnd`.
   - For a letter, move to that child (fail if missing).
   - For `.`, try each child with `i + 1`; return `true` as soon as one branch matches.

## Complexity

- `addWord`: `O(L)`.
- `search`: `O(L)` without dots. Each dot can multiply the branches by up to 26, so `O(26^d · L)` in the worst case — small here because `d <= 2`.
- Space `O(total characters)` for the trie, plus `O(L)` recursion depth.

## Alternatives to mention

- Bucket words by length and compare the pattern against each candidate: simple, but `O(N · L)` per search.
- Precompute every wildcard variant of each word in a hash set: `O(1)`-ish searches but `O(L²)` or more memory per word — only sensible if dots are rare and the alphabet is tiny.

## Pitfalls

- Matching a prefix is not enough: `"ab"` must not match a stored `"abc"`. Check `isEnd` at the end of the pattern.
- A pattern of only dots still requires a stored word of exactly that length.
