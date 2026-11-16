**Key insight:** search for all words at once. A trie of the words lets one DFS per starting cell follow every word sharing the current prefix, and abandon the path the moment no word continues it.

## Approach

1. Insert every word into a trie; store the full word on its end node.
2. From each cell, DFS while carrying the trie node for the path so far:
   - If the cell's letter is not a child of the current node, stop.
   - If the child holds a word, record it and clear it (so it's reported once).
   - Mark the cell (e.g. overwrite with `#`), recurse into the four neighbours, then restore it.
3. **Prune:** after exploring, if a child has no children and no word left, delete it from its parent. Found words disappear from the trie, so later starts stop earlier.

## Complexity

- Time `O(m · n · 4 · 3^(L-1))` in the worst case, `L` the longest word: from each start, the first step has 4 options and each later step at most 3 (you can't go back). The trie means this cost is shared across all words instead of multiplied by their count.
- Space `O(total characters in words)` for the trie, plus `O(L)` recursion.

## Alternatives to mention

- Run single-word Word Search for each word: `O(W · m · n · 3^L)`. Correct, but with tens of thousands of words it's far too slow.

## Pitfalls

- Reporting the same word twice when it can be traced from two different starts — clear `node.word` once found.
- Forgetting to restore the cell after the DFS corrupts later searches.
- Stopping at the first found word: a found word may be a prefix of another (`"app"` and `"apple"`), so keep descending.
