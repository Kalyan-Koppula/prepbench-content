**Key idea:** a node is good when it is at least as large as every value above it on its path, which is the same as being at least the **maximum** value on that path. Pass that maximum down as you recurse: each node compares itself with it once and hands down the updated maximum.

## Recognising the pattern

This is the **top-down** shape from the [Trees](/problems/patterns/trees) sheet: information flows from the root to the leaves through a parameter, instead of results flowing up. Whenever a node's answer depends on its ancestors, pass a summary of the ancestors down.

## Brute force

Keep the whole root-to-node path in a list during a DFS, and compare each node with every value on its path. That is the reference brute force below.

Correct by definition, but each node costs `O(depth)`, so the total is `O(n · h)`: `O(n²)` for a chain. Space `O(h)`.

## Optimal: carry the path maximum

`countGood(node, maxAbove)`:

1. If `node` is null, return 0.
2. `count = 1` if `node.val >= maxAbove`, else 0.
3. `maxHere = max(maxAbove, node.val)`.
4. Return `count + countGood(node.left, maxHere) + countGood(node.right, maxHere)`.

Start with `maxAbove = −∞`, so the root is always good. The comparison is `>=` because equal values don't make a node bad: the rule only forbids values **strictly greater** above it.

The single number `maxAbove` replaces the whole path list, which is all the brute force really used it for.

## Walkthrough

```
      3
     / \
    1   4
   /   / \
  3   1   5
```

| node | max above | good? | max passed down |
| --- | --- | --- | --- |
| 3 (root) | −∞ | yes | 3 |
| 1 | 3 | no | 3 |
| 3 (under 1) | 3 | yes (3 ≥ 3) | 3 |
| 4 | 3 | yes | 4 |
| 1 (under 4) | 4 | no | 4 |
| 5 | 4 | yes | 5 |

Answer `4`.

## Complexity

- Brute force: time `O(n · h)`, space `O(h)`.
- Path maximum: time `O(n)`, space `O(h)` for the recursion.

## Edge cases

- A single node: 1.
- A strictly decreasing chain: only the root is good.
- Equal values all the way down: every node is good.
- Negative values: start from −∞, not 0.

## Common mistakes

- Using `>` instead of `>=`, which marks nodes equal to their ancestors' maximum as bad.
- Starting with `maxAbove = 0`, which breaks on negative values.
- Updating a single shared maximum instead of passing it per path, so one branch affects another.

## In the interview

- Say "pass the maximum on the path down", and point out the `>=`.
- Likely follow-ups:
  - *Count nodes greater than all ancestors (strictly)?* Change the comparison to `>`.
  - *Path sums from root to leaf?* The same top-down shape with a running sum (Path Sum).
  - *Iterative version?* A stack of `(node, maxAbove)` pairs.
