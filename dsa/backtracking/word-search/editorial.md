**Key idea:** try every cell as a starting point and follow the word letter by letter through neighbouring cells. Mark each cell while it is on the current path so it isn't reused, recurse in four directions, and unmark it when backing out. The first complete match answers `true`.

## Recognising the pattern

Paths on a grid that may not revisit a cell, explored exhaustively, are the "mark, recurse, unmark" template from the [Backtracking](/problems/patterns/backtracking) sheet. Matching letters as you go prunes almost every branch immediately.

## Alternative: breadth-first over paths (shown below)

Keep every partial path that spells a prefix of the word, as a list of cells. Extend each by one matching neighbour not already on that path. If any path survives to the full length, the word exists. That is the reference brute force below. Correct, but it stores every partial path at once and checks "already on the path" with a scan, which is far heavier than the DFS.

## Backtracking DFS

`trace(i, r, c)` asks: can `word[i..]` be spelled starting at cell `(r, c)`?

1. If `i == word.length`, the whole word matched: return `true`.
2. If `(r, c)` is outside the grid or its letter isn't `word[i]`, return `false`. A cell already on the path holds `#`, which never matches a letter.
3. Mark the cell `#`, try the four neighbours with `i + 1`, then restore the letter.
4. Return whether any direction succeeded.

`exist` calls `trace(0, r, c)` for every cell.

**Marking in place.** Overwriting the cell with `#` uses no extra memory; a separate `visited` grid works too. Either way, the restore step is what lets other paths use the cell later.

## Walkthrough

```
A B C E
S F C S
A D E E
```

`word = "ABCCED"`: start at (0,0) `A` → (0,1) `B` → (0,2) `C` → (1,2) `C` → (2,2) `E` → (2,1) `D`. Every step matches, so the answer is `true`.

`word = "ABCB"`: after `A → B → C`, the only `B` next to that `C` is (0,1), already on the path (marked `#`), so that branch fails, and no other start works: `false`.

## Complexity

- DFS: time `O(m · n · 4 · 3^(L − 1))` in the worst case for a word of length `L`: every start cell, four first moves, then at most three new directions per step. Space `O(L)` for the recursion.
- Path lists: exponential memory in the worst case.

## Edge cases

- Word longer than `m · n`: impossible.
- Single-letter word: true if the letter appears anywhere.
- Repeated letters (`"AAAA"` in a block of `A`s): the marking stops cells from being reused.

## Common mistakes

- Forgetting to restore the cell, which corrupts later searches.
- Using a global `visited` set without removing cells when backtracking.
- Checking bounds after reading `board[r][c]`.

## In the interview

- Mention pruning by the first letter and, as an optimisation, rejecting immediately if the board doesn't contain enough of each letter.
- Likely follow-ups:
  - *Many words at once?* Build a trie of the words and search once (Word Search II).
  - *Diagonal moves?* Eight neighbours instead of four.
