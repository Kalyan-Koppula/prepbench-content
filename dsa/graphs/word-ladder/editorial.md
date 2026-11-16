**Key insight:** shortest path in an unweighted graph of words → BFS. The trick is finding neighbours fast: a word's one-letter neighbours are exactly the words sharing one of its wildcard patterns (`cold` → `*old`, `c*ld`, `co*d`, `col*`).

## Approach

1. If `endWord` isn't in `wordList`, return `0`.
2. Build `pattern → words` buckets for every word in the list (`L` patterns per word).
3. BFS from `beginWord` with `steps = 1`. For each word popped, generate its patterns; every unvisited word in those buckets is enqueued at `steps + 1`. Return `steps + 1` when you reach `endWord`.
4. After expanding a bucket, clear it — every word in it is now visited, so scanning it again is wasted work.
5. Queue empties → `0`.

## Complexity

- Time `O(n · L²)` — `n · L` patterns, each built in `O(L)`.
- Space `O(n · L²)` — the buckets.

## Alternatives to mention

- **Try all 26 letters** at each position and look the result up in a `Set`: `O(n · 26 · L²)`, no buckets needed. Often what interviewers expect.
- **Bidirectional BFS:** expand from both ends, always growing the smaller frontier. Same worst case but much faster in practice.
- Pairwise comparison to build edges: `O(n² · L)` — too slow at `n = 5000`.

## Pitfalls

- The answer counts **words**, not transformations — `hot → dot` is length `2`.
- Mark words visited when enqueuing, not when dequeuing.
- `beginWord` may or may not be in the list; it must not be returned to later either way.
