**Key insight:** each filled cell belongs to exactly one row, one column and one box. Track a "seen" set for each of those 27 units and fail on the first repeat.

## Approach

1. Make 9 row sets, 9 column sets and 9 box sets.
2. For every non-empty cell `(r, c)` with digit `d`, compute `b = floor(r / 3) * 3 + floor(c / 3)`.
3. If `d` is already in `rows[r]`, `cols[c]` or `boxes[b]`, return `false`; otherwise add it to all three.
4. Return `true` after the scan.

## Complexity

- Time `O(81)` = `O(1)` — the board is fixed-size. For an `n × n` generalisation it's `O(n²)`.
- Space `O(1)` — at most 243 set entries.

## Alternatives to mention

- Three separate passes (rows, then columns, then boxes) — same complexity, more code.
- A single set of strings like `"5 in row 0"`, `"5 in col 3"`, `"5 in box 1"` — compact and readable.
- Bitmasks: a 9-bit integer per unit instead of a set; `mask & (1 << d)` tests membership.

## Pitfalls

- Trying to *solve* the puzzle. A board can satisfy every rule and still have no solution — that still counts as valid.
- Box index arithmetic: `floor(r / 3) * 3 + floor(c / 3)`, not `r / 3 + c / 3`.
