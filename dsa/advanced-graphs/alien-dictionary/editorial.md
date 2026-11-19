**Key idea:** a sorted word list reveals letter order through **adjacent pairs**: the first position where two neighbouring words differ says that letter comes before the other. Collect those rules as edges between letters, then topologically sort the letters. A cycle, or a longer word listed before its own prefix, means no order exists.

## Recognising the pattern

Deriving an order from comparisons is building a dependency graph and topologically sorting it, from the [Advanced Graphs](/problems/patterns/advanced-graphs) sheet. The graph has at most 26 nodes; the work is extracting the edges correctly.

## Alternative: DFS topological sort (shown below)

Build the same edges, then DFS with three colours: finding a letter already on the current path means a cycle. Letters in reverse finishing order form a valid alphabet. That is the reference brute force below; it is equally efficient.

## Building rules, then Kahn's algorithm

1. Mark every letter that appears in any word.
2. For each adjacent pair `a`, `b`:
   1. Find the first index `j` where they differ.
   2. If there is none and `a` is longer than `b`, the list is invalid (a word can't come before its own prefix): return `""`.
   3. Otherwise add the rule `a[j] → b[j]` (once).
3. Kahn's algorithm over the present letters: start with letters that have no incoming rules; taking a letter releases letters whose last incoming rule it was.
4. If not every letter was taken, the rules contain a cycle: return `""`.

**Only adjacent pairs and only the first difference.** Letters after the first difference say nothing: `"abz"` before `"acb"` tells you `b < c`, but nothing about `z` and `b`. Non-adjacent pairs add no information that the adjacent ones don't already imply.

## Walkthrough

`words = ["wrt", "wrf", "er", "ett", "rftt"]`

| pair | first difference | rule |
| --- | --- | --- |
| wrt, wrf | t vs f | t → f |
| wrf, er | w vs e | w → e |
| er, ett | r vs t | r → t |
| ett, rftt | e vs r | e → r |

Rules form the chain `w → e → r → t → f`. Answer `"wertf"`.

## Complexity

- Time `O(C)` where `C` is the total number of characters in all words (to extract rules), plus `O(26²)` for the sort. Space `O(26²)`.

## Edge cases

- One word: any order of its letters is valid.
- A word followed by its own prefix, like `["abc", "ab"]`: invalid, `""`.
- Letters that appear but are never compared: they can go anywhere, typically first.
- Contradictory rules (`a → b` and `b → a`): a cycle, `""`.

## Common mistakes

- Adding rules from every pair of positions instead of only the first difference.
- Forgetting letters that never appear in a rule.
- Missing the prefix check.
- Counting a repeated rule twice in the in-degree.

## In the interview

- Explain what one adjacent pair tells you and why later positions don't matter.
- Likely follow-ups:
  - *Verify a given order (Verifying an Alien Dictionary)?* Map letters to ranks and compare adjacent words.
  - *Is the order unique?* It is unique exactly when Kahn's ready list never holds more than one letter.
