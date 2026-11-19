**Key idea:** treat every word as a node, with an edge between words that differ in one letter. The shortest ladder is a shortest path, so use BFS from `beginWord`. To find a word's neighbours quickly, try every single-letter change (word length × 26 candidates) and look each one up in a set, rather than comparing against every dictionary word.

## Recognising the pattern

"Fewest transformation steps" in an unweighted graph is BFS, the core of the [Graphs](/problems/patterns/graphs) sheet. The graph is never built explicitly; neighbours are generated on demand.

## Brute force

BFS where, to expand a word, you compare it with every dictionary word to see whether they differ by one letter. That is the reference brute force below. Each expansion is `O(N · L)`, so the whole search is `O(N² · L)` for `N` words of length `L`. With 5,000 words, that is over 100 million comparisons.

## BFS with generated neighbours

1. Put the dictionary in a set. If `endWord` isn't in it, return 0.
2. BFS by levels, starting from `[beginWord]` with `words = 1`.
3. For each word in the current level, for each position and each letter `a`–`z`, build the candidate word. If it is in the set:
   - If it is `endWord`, return `words + 1`.
   - Otherwise remove it from the set (marking it visited) and add it to the next level.
4. After each level, `words++`. If the levels run out, return 0.

Removing visited words from the set means each word is expanded at most once and keeps later lookups from finding it again.

**Pattern buckets** are an alternative: map patterns like `h*t` to the words that match them, so neighbours share a bucket. Same idea, different bookkeeping.

## Walkthrough

`beginWord = "hit"`, `endWord = "cog"`, `wordList = ["hot", "dot", "dog", "lot", "log", "cog"]`

| words so far | level | next level |
| --- | --- | --- |
| 1 | hit | hot |
| 2 | hot | dot, lot |
| 3 | dot, lot | dog, log |
| 4 | dog, log | cog found |

Answer `5`: `hit → hot → dot → dog → cog`.

## Complexity

- Compare with every word: time `O(N² · L)`, space `O(N)`.
- Generated neighbours: time `O(N · L · 26 · L)`: each word is expanded once, producing `26L` candidates that each cost `O(L)` to build and hash. Space `O(N · L)` for the set and the queue.

## Edge cases

- `endWord` not in the list: 0 immediately.
- `beginWord` equal to `endWord`: by the statement's counting, a ladder needs at least one step; check the problem's convention.
- No path: the BFS runs out, return 0.

## Common mistakes

- Marking words visited when dequeued instead of when enqueued, which adds duplicates to the queue.
- Counting steps instead of words (off by one).
- DFS, which finds a ladder but not the shortest.

## In the interview

- Say it's a shortest path in an implicit graph, then discuss how to generate neighbours efficiently.
- Mention bidirectional BFS: search from both ends and stop when they meet, which explores far fewer words.
- Likely follow-ups:
  - *Return all shortest ladders (Word Ladder II)?* BFS to build parent links per level, then DFS back from the end.
  - *Minimum genetic mutation?* The same BFS over a 4-letter alphabet.
