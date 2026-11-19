**Key idea:** give every node its coordinates, then sort. A DFS records `(row, column, value)` for each node. Sorting by column, then row, then value puts every node exactly where the output needs it, and cutting the sorted list wherever the column changes produces the groups.

## Recognising the pattern

Positions in a tree are a [Trees](/problems/patterns/trees) sheet idea: pass coordinates down as you recurse, the root at `(0, 0)` and children at `(row + 1, col ∓ 1)`. The tie-break rule (equal row and column sorted by value) is what makes a plain BFS insufficient on its own, and a sort the natural tool.

## Brute force

BFS to get every node's row and column. Then for each column from the leftmost to the rightmost, scan all nodes, pick the ones in that column, and order them by row then value. That is the reference brute force below.

Correct, but every column scans all `n` nodes: `O(n · c)` for `c` columns, up to `O(n²)` for a long diagonal chain.

## Optimal: record coordinates, sort once

1. DFS from the root with `(row, col) = (0, 0)`. For each node, record `row`, `col` and `val`. Left child: `(row + 1, col − 1)`. Right child: `(row + 1, col + 1)`.
2. Sort the records by column, then row, then value.
3. Walk the sorted records, starting a new group whenever the column changes.

The three-key comparison handles every rule at once: columns left to right, top to bottom within a column, and smaller values first when two nodes share a row and column.

The reference solution sorts an array of indices with a comparator over three parallel arrays, which reads the same in any language.

## Walkthrough

```
      3
     / \
    9   20
       /  \
      15   7
```

| node | row | col |
| --- | --- | --- |
| 3 | 0 | 0 |
| 9 | 1 | −1 |
| 20 | 1 | 1 |
| 15 | 2 | 0 |
| 7 | 2 | 2 |

Sorted by (col, row, val): `9 (−1)`, `3 (0, row 0)`, `15 (0, row 2)`, `20 (1)`, `7 (2)`.

Result `[[9], [3, 15], [20], [7]]`.

## Complexity

- Per-column scans: time `O(n · c)`, up to `O(n²)`. Space `O(n)`.
- Record and sort: time `O(n log n)`, space `O(n)`.

## Edge cases

- One node: `[[val]]`.
- Two nodes at the same row and column (from different parents): ordered by value.
- A chain going only left: one node per column.

## Common mistakes

- Sorting by value only within a column, ignoring rows.
- Using BFS order for ties at the same row and column, when the rule here is ascending value.
- Assuming columns start at 0; they can be negative.

## In the interview

- Ask how ties are broken; this problem has several variants with different rules.
- Likely follow-ups:
  - *Ties keep BFS order (left before right) instead of value?* BFS with a map from column to list, no sort within a column; track the minimum and maximum column.
  - *Top view or bottom view?* Keep only the first or last node per column in BFS.
