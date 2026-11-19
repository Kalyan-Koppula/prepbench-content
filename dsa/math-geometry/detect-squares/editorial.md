**Key idea:** store how many copies of each point were added. For a query point `q`, every stored point `d` that could be the corner **diagonally opposite** `q` decides the whole square: `d` must differ from `q` by the same non-zero amount in `x` and in `y`, and the other two corners are then `(q.x, d.y)` and `(d.x, q.y)`. Multiply the copy counts of the three corners and sum over all candidates.

## Recognising the pattern

Counting geometric shapes among points, where fixing one or two points determines the rest, is a hash-map counting problem from the [Math & Geometry](/problems/patterns/math-geometry) and [Arrays & Hashing](/problems/patterns/arrays-hashing) sheets. Duplicates matter: each copy is a different point, so counts multiply.

## Brute force

Store every added point in a list, duplicates included. For each stored point that could be the diagonal corner, count the other two corners by scanning the list. That is the reference brute force below. `O(p²)` per query for `p` stored points.

## Counts per point

1. `add(p)`: increment the count for `p`; remember `p` in a list of distinct points the first time it appears.
2. `count(q)`: for each distinct point `d`:
   - Skip it if `d.x = q.x` (zero side) or `|d.x − q.x| ≠ |d.y − q.y|` (not a square's diagonal).
   - Add `count(d) · count(q.x, d.y) · count(d.x, q.y)`.

A point can be encoded as one integer key `x · 1001 + y`, since coordinates are between 0 and 1000.

**Why the diagonal corner.** Choosing the opposite corner fixes the side length and direction at once. Each axis-aligned square containing `q` has exactly one corner opposite `q`, so each square is counted exactly once (times its copy counts).

## Walkthrough

Add `(1, 1)`, `(1, 3)`, `(3, 1)`. Query `(3, 3)`:

| candidate d | diagonal? | corners (3, d.y), (d.x, 3) | contribution |
| --- | --- | --- | --- |
| (1, 1) | yes, side 2 | (3, 1): 1, (1, 3): 1 | 1 · 1 · 1 = 1 |
| (1, 3) | no (dy = 0) | – | 0 |
| (3, 1) | no (same x) | – | 0 |

Answer `1`. After adding `(3, 1)` again, its count is 2 and the same query returns `2`.

## Complexity

- Brute force: `O(p²)` per query, `O(1)` per add.
- Counts per point: `O(1)` per add, `O(d)` per query for `d` distinct points, `O(d)` space.
- Grouping points by `x` (a map from `x` to the counts of each `y`) lets the query loop over one column instead of all points; useful when points are spread out.

## Edge cases

- The query point itself added before: it can't be its own diagonal (zero side), so it is skipped.
- Duplicates of any corner: counts multiply.
- Squares in all four directions from `q`: the absolute-value check covers them all.

## Common mistakes

- Counting zero-area squares (forgetting the `d.x = q.x` check).
- Ignoring duplicates (using a set instead of counts).
- Counting each square several times by iterating over adjacent corners instead of the diagonal one.

## In the interview

- Explain why the diagonal corner determines the square; then the loop is short.
- Likely follow-ups:
  - *Rectangles instead of squares?* Pairs of points sharing an `x` define vertical sides; count matching pairs per column-pair.
  - *Rotated squares?* Fix two points as one side and compute the other two corners with a 90° rotation of the side vector.
