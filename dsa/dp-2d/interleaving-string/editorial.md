**Key insight:** the state is just "how many characters of `s1` and of `s2` have been used" — the prefix of `s3` built so far is then fixed (`i + j` characters), so only `(m + 1)(n + 1)` situations exist.

## Approach

1. If `m + n !== s3.length`, return `false`.
2. **State:** `ok[i][j]` = `s3[0 … i+j-1]` is an interleaving of `s1[0 … i-1]` and `s2[0 … j-1]`.
3. **Recurrence:** the last character `s3[i + j - 1]` came from one of the two strings:
   - `ok[i-1][j] && s1[i-1] === s3[i+j-1]`, or
   - `ok[i][j-1] && s2[j-1] === s3[i+j-1]`.
4. **Base case:** `ok[0][0] = true`. The first row/column follow from the same recurrence with one option missing (only `s2` / only `s1`).
5. **Order:** `i` increasing, `j` increasing. Answer `ok[m][n]`.
6. **Space optimisation:** one array over `j`. When computing `ok[j]`, its old value is `ok[i-1][j]` and `ok[j-1]` is already `ok[i][j-1]`.

Progression: the brute recursion "take the next char from `s1` or `s2`" branches whenever both fronts match — exponential on inputs like `"aaa…"`; memoise on `(i, j)`; tabulate; roll into one row.

## Complexity

- Time `O(m · n)`.
- Space `O(n)` with the rolling row (choose the shorter string for the row).

## Alternatives to mention

- BFS/DFS over `(i, j)` with a visited set — the same state space explored as a graph.

## Pitfalls

- A greedy "take from `s1` whenever it matches" fails when both strings offer the same character (`"aab"`, `"ac"`, `"aacab"`).
- Two-pointer tricks can't decide ties — that's exactly why DP is needed.
- Forgetting the length check makes `ok[m][n]` index past the end of `s3`.
