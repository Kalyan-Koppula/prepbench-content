**Key idea:** it is easier to find the `O`s that **can't** be captured. Any `O` region that touches the border is safe, and so is everything connected to it. Flood-fill from every border `O` and mark those cells safe; every `O` left unmarked is enclosed and becomes `X`.

## Recognising the pattern

"Regions enclosed by something" is a connected-component problem from the [Graphs](/problems/patterns/graphs) sheet, solved by **reversing the question**: start from the boundary instead of testing each region. The same trick appears in Pacific Atlantic Water Flow and Number of Enclaves.

## Alternative: check each region (shown below)

For each unvisited `O`, collect its whole region with BFS while noting whether any cell lies on the border. If none does, turn the whole region into `X`. That is the reference brute force below. Same `O(m · n)` time; it just needs a `visited` grid and a list per region.

## Flood from the border

1. For every `O` on the border, run a flood fill that changes connected `O`s to a temporary mark `S` (safe).
2. Scan the whole board: remaining `O`s are captured, so set them to `X`; `S` cells go back to `O`.

Changing cells to `S` doubles as the visited mark, and the final pass undoes it.

## Walkthrough

```
X X X X        X X X X
X O O X   →    X X X X
X X O X        X X X X
X O X X        X O X X
```

| step | detail |
| --- | --- |
| border scan | the only border `O` is (3, 1); mark it `S` |
| flood from (3, 1) | its neighbours are all `X`, so nothing else is marked |
| final pass | (1, 1), (1, 2), (2, 2) are still `O`: captured → `X`; (3, 1) goes back to `O` |

## Complexity

- Time `O(m · n)`: each cell is marked at most once and scanned twice.
- Space `O(m · n)` for the flood-fill stack in the worst case.

## Edge cases

- One row or one column: every cell is on the border, so nothing is captured.
- No `O`s: nothing changes.
- An `O` region touching the border at a single cell: all of it is safe.

## Common mistakes

- Treating an `O` as safe only if it is on the border itself, rather than connected to the border.
- Capturing regions that touch the border diagonally only: diagonal contact doesn't connect, but a single border cell in the region makes it safe.
- Recursion depth on a large board full of `O`s.

## In the interview

- Say the reversal out loud: "find the safe cells from the edge instead."
- Likely follow-ups:
  - *Count enclosed land cells (Number of Enclaves)?* The same border flood, then count what's left.
  - *Union-find version?* Union every border `O` with a virtual "border" node, and neighbours with each other; capture cells not connected to it.
