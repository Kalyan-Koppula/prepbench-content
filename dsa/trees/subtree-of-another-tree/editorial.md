**Key idea:** `subRoot` appears inside `root` if, at some node of `root`, the whole tree starting there is identical to `subRoot`. Walk every node of `root` and run the Same Tree check from it. The first match answers `true`.

## Recognising the pattern

It is Same Tree applied at every node, a combination of "visit every node" and "compare two trees in parallel" from the [Trees](/problems/patterns/trees) sheet. The serialisation approach turns it into a string search, which is useful to mention.

## Approach 1: check every node (reference solution)

1. If `root` is null, return `false` (an empty tree has no non-empty subtree).
2. If `sameTree(root, subRoot)`, return `true`.
3. Otherwise return `isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)`.

`sameTree` is the usual comparison: both null is a match, one null is not, values must match, and both pairs of children must match.

Time `O(n · m)` in the worst case: `n` starting nodes, each comparison up to `m` nodes. In practice most comparisons fail at the first value.

## Approach 2: serialise and search (shown below as the alternative)

Serialise both trees in preorder with a marker for every null child, and prefix every value with a separator (`,1,2,#,#,#`). Then `subRoot` is a subtree of `root` exactly when its serialisation is a contiguous piece of `root`'s.

- The **null markers** make the shape part of the string, so a node with extra children doesn't match.
- The **leading separator** stops `2` from matching the tail of `12`.

With a linear-time string search (KMP or Z-algorithm) this is `O(n + m)`. With a built-in `indexOf` it is usually fast but not guaranteed linear.

## Walkthrough

`root = [3, 4, 5, 1, 2]`, `subRoot = [4, 1, 2]`

| node of root | sameTree? | reason |
| --- | --- | --- |
| 3 | no | 3 ≠ 4 |
| 4 | yes | 4 = 4, left 1 = 1, right 2 = 2, all leaves match |

Answer `true`. If the `2` under `4` had a child `0`, `sameTree` at `4` would fail on the extra node, and no other node would match.

## Complexity

- Check every node: time `O(n · m)` worst case, space `O(h)` for recursion.
- Serialise and search: time `O(n + m)` with KMP, space `O(n + m)` for the strings.

## Edge cases

- `subRoot` equal to the whole of `root`: matched at the root.
- Same values, different shape: the null checks in `sameTree` reject it.
- Matching values near the leaves but extra nodes below: a subtree must include all descendants, so it fails.

## Common mistakes

- Treating "has the same values somewhere" as a match without checking the whole subtree below.
- Serialising without null markers or separators.
- Returning `true` when `root` is null.

## In the interview

- Start with "same tree at every node" and its `O(n · m)` cost, then offer serialisation plus KMP for linear time.
- Likely follow-ups:
  - *Many queries against one big tree?* Hash every subtree bottom-up (Merkle-style) and compare hashes, verifying on a hash match.
  - *Find duplicate subtrees?* Serialise every subtree and count them in a map.
