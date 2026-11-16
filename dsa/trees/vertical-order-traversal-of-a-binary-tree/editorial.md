**Key insight:** turn the tree into a list of `(col, row, val)` triples and sort — the three ordering rules become one lexicographic comparison.

## Approach

1. DFS (or BFS) from the root carrying `(row, col)`; record `[col, row, val]` for every node.
2. Sort by `col`, then `row`, then `val`.
3. Sweep the sorted list, starting a new group whenever `col` changes.

## Complexity

- Time `O(n log n)` for the sort; the traversal is `O(n)`.
- Space `O(n)` for the triples.

## Alternatives to mention

- `Map<col, [row, val][]>` plus tracking `minCol`/`maxCol`; sort each column's entries separately. Same big-O, slightly less sorting work.
- **BFS** visits rows in order, so within a column you only need to sort entries that share a row.

## Pitfalls

- The tie rule only applies to nodes at the same row **and** column. Two nodes in the same column but different rows are ordered by row, regardless of value.
- Sorting by insertion order instead of value on ties: a DFS meets the left subtree first, but the problem wants the smaller value first.
- The simpler "vertical order" variant (ties broken left to right instead of by value) is a different problem — confirm which one the interviewer means.

## Follow-ups

- Top view / bottom view: keep only the first / last node per column in BFS order.
