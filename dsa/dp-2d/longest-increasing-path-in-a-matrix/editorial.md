**Key insight:** strictly increasing moves can't loop, so the matrix is a DAG; the longest path *starting* at a cell depends only on its larger neighbours and never changes — memoised DFS computes each cell once.

## Approach

- **State:** `len[r][c]` = number of cells on the longest strictly increasing path that starts at `(r, c)`.
- **Recurrence:** `len[r][c] = 1 + max(len[nr][nc])` over the 4 neighbours with `matrix[nr][nc] > matrix[r][c]` (or `1` if none).
- **Base case:** a local maximum (no larger neighbour) has `len = 1`.
- **Order:** there's no simple row/column order — dependencies follow values. Either recurse with memoisation (top-down handles the order for you), or process cells in **decreasing value** order (sort, then fill bottom-up).
- **Answer:** the maximum `len` over all cells.
- No visited set is needed: the strict increase already rules out cycles.

Progression: plain DFS from every cell re-explores the same paths — exponential in the worst case; caching `len` per cell makes it `O(m · n)`. Bottom-up needs a topological order (sort by value or Kahn's algorithm).

## Complexity

- Time `O(m · n)` — each cell's DFS body runs once and checks 4 neighbours.
- Space `O(m · n)` for the memo plus recursion depth up to `m · n` on a snake-shaped path.

## Alternatives to mention

- **Topological peeling (Kahn):** compute each cell's count of smaller neighbours, start a BFS from cells with count `0`, and peel layer by layer. The number of layers is the answer. Iterative, so no recursion-depth risk — worth mentioning for JS, where very deep recursion can overflow the stack.
- Sort cells by value and relax neighbours in that order: `O(mn log mn)`.

## Pitfalls

- Adding a `visited` set "to avoid cycles" — it's unnecessary and, if not cleared correctly, gives wrong answers.
- Using `>=` instead of `>` creates cycles among equal values and infinite recursion.
