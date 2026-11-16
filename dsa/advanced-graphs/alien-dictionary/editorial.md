**Key insight:** the sorted list encodes "letter `a` comes before letter `b`" facts — one per adjacent pair of words, at their first difference. Collect those edges and topologically sort the letters; a cycle means the list is inconsistent.

## Approach

1. Register every letter that appears anywhere (indegree `0`), so letters with no constraints still appear in the output.
2. For each adjacent pair `w1, w2`: find the first index where they differ and add edge `w1[i] → w2[i]` (skip if that edge already exists, so indegrees aren't double counted). If there's no difference and `w1` is longer than `w2`, the list is invalid → `""`.
3. Kahn's algorithm over the letters. If fewer letters are output than exist, there's a cycle → `""`.

## Complexity

With `C` total characters across all words:

- Time `O(C)` — one scan for letters, one comparison per adjacent pair, and a topological sort over at most 26 letters and 26² edges.
- Space `O(1)` — bounded by the alphabet size (26 nodes, ≤ 676 edges).

## Pitfalls

- Comparing letters **after** the first difference — they carry no information.
- The prefix case: `["abc", "ab"]` is impossible, not "no constraints".
- Forgetting letters that never appear in any constraint.
- Duplicate edges inflate indegrees and make Kahn's algorithm report a false cycle — dedupe them.
- Comparing every pair of words (not just adjacent ones) is redundant: the adjacent constraints imply the rest.
