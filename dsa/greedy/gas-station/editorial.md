**Key insight:** if a start at `s` runs dry on the way to `j`, every station between `s` and `j` fails too — so jump the candidate straight to `j + 1`. And a valid start exists exactly when total gas ≥ total cost.

## Approach

1. Work with `diff[i] = gas[i] - cost[i]`.
2. Sweep once, keeping `tank` (fuel since the current candidate `start`) and `total` (sum of all diffs).
3. When `tank` drops below zero at `i`, set `start = i + 1` and reset `tank = 0`.
4. After the sweep, return `start` if `total >= 0`, else `-1`.

Why skipping is safe: when you arrived at any station `k` in `(start, i]` you had `tank >= 0`. Starting fresh at `k` gives you that amount *less* fuel, so you'd fail at `i` as well.

Why the final `start` completes the lap: resets happen exactly when the running prefix sum hits a new low, so `start` sits just after the lowest prefix. Measured from there the running sum never dips below zero to the end of the array, and wrapping around adds `total >= 0` on top.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- Simulate from every start: `O(n²)`.
- Prefix-sum view: the answer is the index right after the minimum prefix sum of `diff`.

## Pitfalls

- Returning `start` without checking `total` — the loop alone can't detect an impossible circuit.
- `start` can end at `n` only when `total < 0`, so it never leaks as an answer.
