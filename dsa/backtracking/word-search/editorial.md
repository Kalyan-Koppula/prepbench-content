**Key insight:** a DFS from each cell that matches the next letter, marking the cells on the current path so they aren't reused, and restoring them on the way back.

## Approach

1. For every cell, call `dfs(r, c, 0)`.
2. `dfs(r, c, i)`:
   - If `i === word.length`, the whole word matched — return `true`.
   - If out of bounds, already on the path, or `board[r][c] !== word[i]`, return `false`.
   - Temporarily overwrite the cell with a sentinel (`#`), try the four neighbours with `i + 1`, then restore the cell.
3. Return `true` as soon as any start succeeds.

## Complexity

- Time `O(m · n · 3^L)`: each start explores at most 4 directions first, then at most 3 (you can't step back onto the path).
- Space `O(L)` recursion depth; marking in place avoids a separate `visited` grid.

## Follow-ups (pruning)

- If `word` is longer than `m · n`, return `false`.
- Count letters: if the board has fewer of some letter than `word` needs, return `false` without searching.
- If the word's last letter is rarer on the board than its first, search for the reversed word — fewer starting points.

## Pitfalls

- Forgetting to restore the cell — later starts see a corrupted board.
- Checking `i === word.length` *after* the bounds check fails when the word ends on an edge cell.
