**Key insight:** flip the question. Instead of testing whether each region is enclosed, find the regions that **escape** — those touching the border — and capture everything else.

## Approach

1. For every `"O"` on the border, flood fill (DFS/BFS) and relabel its whole region with a temporary marker such as `"S"` (safe).
2. Sweep the board: remaining `"O"` → `"X"` (captured), `"S"` → `"O"` (restored).

Two passes, no per-region bookkeeping.

## Complexity

- Time `O(m · n)` — each cell is visited by at most one flood fill plus the final sweep.
- Space `O(m · n)` — the flood-fill stack in the worst case.

## Alternatives to mention

- Flood each interior region and check whether it ever touched the border, then flip it if not. Also linear, but you must remember the region's cells until you know the verdict.
- Union-find with a virtual "border" node: union border `"O"`s with it, union adjacent `"O"`s, then capture any `"O"` not connected to the border node.

## Pitfalls

- Flipping cells while still discovering a region can capture part of a region that later turns out to reach the border.
- Boards with one row or column: every cell is a border cell, so nothing is captured.
