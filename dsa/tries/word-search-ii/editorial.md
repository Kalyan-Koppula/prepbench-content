**Key idea:** instead of searching the grid once per word, put all the words in a trie and search the grid once, walking the grid and the trie together. A path on the board continues only while the trie has a child for the next letter, so dead ends for every word are cut at the same time.

## Recognising the pattern

Word Search for one word is grid backtracking. With thousands of words, repeating that search is too slow. Combining many words into one structure that can say "no word continues this way" is exactly what a trie does, from the [Tries](/problems/patterns/tries) sheet, used together with the grid DFS from the [Backtracking](/problems/patterns/backtracking) sheet.

## Brute force

For each word, run the single-word search: try every starting cell and backtrack over neighbours. That is the reference brute force below. Time `O(W × m × n × 4^L)` in the worst case for `W` words of length up to `L`.

## Optimal: trie-guided DFS with pruning

1. Build a trie of the words. Store the whole word on its end node instead of a boolean.
2. From every cell, run `search(r, c, parentNode)`:
   1. If the cell is already used on the current path, stop.
   2. Look up the trie child for the cell's letter. If there is none, stop: no word continues this way.
   3. If the child holds a word, record it and clear it, so it is reported once.
   4. Mark the cell as used, recurse into the four neighbours with the child, and unmark the cell.
   5. **Prune:** if the child now has no children and no word, remove it from its parent.
3. Return the recorded words.

**Why pruning matters.** Once every word through a branch has been found, the branch can never produce anything new. Removing it means later starting cells don't explore those letters at all, which turns many worst-case inputs from slow to fast.

## Walkthrough

```
o a a n
e t a e
i h k r
i f l v
```

`words = ["oath", "pea", "eat", "rain"]`

| start | path in grid | trie path | found |
| --- | --- | --- | --- |
| (0,0) o | o → a → t → h | o-a-t-h | oath |
| (1,0) e | e → a → t | e-a-t | eat |
| any p | no `p` on the board | – | – |
| (2,3) r | r → a? no `a` next to it | stops at once | – |

Result `["oath", "eat"]` in any order.

## Complexity

- One search per word: `O(W × m × n × 4^L)` worst case.
- Trie-guided: building the trie is `O(total word length)`. The search is `O(m × n × 4 × 3^(L − 1))` in the worst case, because after the first step each cell has at most three unvisited neighbours, and it no longer multiplies by the number of words. Pruning usually makes it much faster. Space `O(total word length)` for the trie, plus `O(L)` recursion.

## Edge cases

- A word longer than the number of cells: it can't be traced and is never found.
- Words sharing prefixes: they share trie nodes and are found in the same walk.
- The same word reachable along several paths: cleared after the first find.

## Common mistakes

- Reporting a word every time it is traced.
- Forgetting to restore the cell after backtracking.
- Checking `used` with a separate array but forgetting to reset it between words in the brute force.
- Building the trie but still looping over the words for each cell.

## In the interview

- Start from the single-word search and its cost per word, then: "I'll merge all words into a trie so one search covers them."
- Mention pruning as the optimisation that makes the worst cases manageable.
- Likely follow-ups:
  - *Return counts instead of words?* Same search, count instead of collect.
  - *Diagonal moves allowed?* Eight neighbours instead of four; the trie logic doesn't change.
