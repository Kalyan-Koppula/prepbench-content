**Key insight:** work bottom-up — every position's best path to the bottom is its own value plus the better of its two children, and the apex's value is then the answer with no "which end point?" question.

## Approach

- **State:** `best[i][j]` = minimum sum of a path from `(i, j)` down to the last row.
- **Recurrence:** `best[i][j] = triangle[i][j] + min(best[i + 1][j], best[i + 1][j + 1])`.
- **Base case:** the last row: `best[n - 1][j] = triangle[n - 1][j]`.
- **Order:** rows from `n - 2` up to `0`; within a row any order. Answer `best[0][0]`.
- **Space optimisation:** row `i` reads only row `i + 1`. Keep one array initialised to the last row; updating `below[j]` left to right is safe because `below[j + 1]` hasn't been overwritten yet for this row.

Progression: top-down recursion `f(i, j) = t[i][j] + min(f(i+1, j), f(i+1, j+1))` is `O(2ⁿ)`; memoise on `(i, j)` for `O(n²)`; tabulate bottom-up; keep one row.

## Complexity

- Time `O(n²)` — each of the `n(n+1)/2` cells once.
- Space `O(n)` for the single row.

## Alternatives to mention

- Top-down tabulation (`best` = cost to reach `(i, j)`) also works, but then take `min` over the last row and handle the edges of each row (`j = 0` and `j = i` have one parent).

## Pitfalls

- Greedy "pick the smaller child" fails: a large value now can lead to much smaller ones below.
- Values can be negative — initialise with `Infinity`, never `0`, if you use a reachability table.
- Mutating the input triangle saves memory but ask first.
